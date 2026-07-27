export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)

  if (!code) {
    return sendRedirect(event, '/auth/login?error=google_failed')
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw createError({ statusCode: 500, statusMessage: 'Configuration Google OAuth manquante' })
  }

  // Échanger le code contre un access_token
  const tokenResponse = await $fetch<{ access_token: string }>(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    },
  ).catch(() => null)

  if (!tokenResponse?.access_token) {
    return sendRedirect(event, '/auth/login?error=google_failed')
  }

  // Récupérer les infos utilisateur Google
  const googleUser = await $fetch<{
    id: string
    email: string
    given_name?: string
    family_name?: string
    picture?: string
  }>('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
  }).catch(() => null)

  if (!googleUser?.email) {
    return sendRedirect(event, '/auth/login?error=google_failed')
  }

  // Chercher un user existant par googleId ou email
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId: googleUser.id },
        { email: googleUser.email },
      ],
    },
  })

  if (user) {
    if (user.googleId === googleUser.id) {
      // User trouvé par googleId → mettre à jour l'avatar si changé
      if (googleUser.picture && googleUser.picture !== user.avatar) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar: googleUser.picture },
        })
      }
    } else {
      // User trouvé par email sans googleId → lier le compte Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.id,
          avatar: googleUser.picture || user.avatar,
          emailVerified: true,
        },
      })
    }
  } else {
    // Aucun user → créer un nouveau compte
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        googleId: googleUser.id,
        firstName: googleUser.given_name || null,
        lastName: googleUser.family_name || null,
        avatar: googleUser.picture || null,
        password: null,
        role: 'APPRENANT',
        emailVerified: true,
      },
    })
  }

  const token = generateToken({ userId: user.id, email: user.email, role: user.role })

  setCookie(event, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return sendRedirect(event, '/auth/login?google=success')
})
