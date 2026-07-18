export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Rate limiting : 5 tentatives par IP par fenêtre de 15 minutes
  const ip = getHeader(event, 'x-forwarded-for') || getRequestURL(event).hostname || 'unknown'
  const { allowed, retryAfterMs } = checkRateLimit(`login:${ip}`, { windowMs: 15 * 60 * 1000, maxAttempts: 5 })
  if (!allowed) {
    throw createError({ statusCode: 429, statusMessage: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfterMs / 1000)} secondes.` })
  }

  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email et mot de passe requis' })
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } })

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect' })
  }

  if (!user.password) {
    throw createError({ statusCode: 401, statusMessage: 'Ce compte utilise la connexion Google' })
  }

  const valid = await comparePassword(body.password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect' })
  }

  if (!user.active) {
    throw createError({ statusCode: 403, statusMessage: 'Compte désactivé' })
  }

  const token = generateToken({ userId: user.id, email: user.email, role: user.role })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    },
  }
})
