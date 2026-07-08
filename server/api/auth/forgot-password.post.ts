import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const ip = getHeader(event, 'x-forwarded-for') || getRequestURL(event).hostname || 'unknown'
  const { allowed, retryAfterMs } = checkRateLimit(`forgot:${ip}`, { windowMs: 15 * 60 * 1000, maxAttempts: 3 })
  if (!allowed) {
    throw createError({ statusCode: 429, statusMessage: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfterMs / 1000)} secondes.` })
  }

  const message = 'Si cet email existe, un lien de réinitialisation a été envoyé'

  if (!body.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email requis' })
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } })

  if (!user) {
    return { message }
  }

  const token = randomBytes(32).toString('hex')

  await prisma.passwordReset.deleteMany({
    where: { email: user.email, used: false },
  })

  await prisma.passwordReset.create({
    data: {
      email: user.email,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Reset link: http://localhost:3000/auth/reset-password?token=' + token)
  }

  return { message }
})
