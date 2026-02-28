export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const ip = getHeader(event, 'x-forwarded-for') || getRequestURL(event).hostname || 'unknown'
  const { allowed, retryAfterMs } = checkRateLimit(`register:${ip}`, { windowMs: 60 * 60 * 1000, maxAttempts: 3 })
  if (!allowed) {
    throw createError({ statusCode: 429, statusMessage: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfterMs / 1000)} secondes.` })
  }

  if (!body.email || !body.password || !body.firstName) {
    throw createError({ statusCode: 400, statusMessage: 'Email, mot de passe et prénom requis' })
  }

  if (body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Le mot de passe doit contenir au moins 8 caractères' })
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Cet email est déjà utilisé' })
  }

  const hashedPassword = await hashPassword(body.password)

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName || null,
      role: body.role || 'APPRENANT',
    },
  })

  const token = generateToken({ userId: user.id, email: user.email, role: user.role })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  }
})
