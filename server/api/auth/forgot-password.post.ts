import { randomBytes } from 'crypto'
import { buildPasswordResetEmail, getAppBaseUrl } from '../../utils/emailTemplates'
import { sendMail } from '../../utils/mailer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed, retryAfterMs } = checkRateLimit(`forgot:${ip}`, { windowMs: 15 * 60 * 1000, maxAttempts: 3 })
  if (!allowed) {
    throw createError({ statusCode: 429, statusMessage: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfterMs / 1000)} secondes.` })
  }

  const message = 'Si cet email existe, un lien de réinitialisation a été envoyé'

  const email = String(body?.email || '').trim().toLowerCase()
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email requis' })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Toujours la même réponse (anti-énumération)
  if (!user || !user.active) {
    return { message }
  }

  const token = randomBytes(32).toString('hex')
  const expiresInMinutes = 60

  await prisma.passwordReset.deleteMany({
    where: { email: user.email, used: false },
  })

  await prisma.passwordReset.create({
    data: {
      email: user.email,
      token,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    },
  })

  const resetUrl = `${getAppBaseUrl()}/auth/reset-password?token=${token}`
  const mail = buildPasswordResetEmail({
    firstName: user.firstName,
    email: user.email,
    resetUrl,
    expiresInMinutes,
  })

  try {
    await sendMail({
      to: user.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    })
  } catch (err) {
    console.error('[forgot-password] Échec envoi email:', err)
    // En dev, on expose le lien dans les logs pour tester sans SMTP
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] Reset link:', resetUrl)
    }
    // On ne révèle pas l'échec SMTP au client (même message)
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Reset link:', resetUrl)
  }

  return { message }
})
