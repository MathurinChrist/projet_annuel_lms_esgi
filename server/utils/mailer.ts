import nodemailer from 'nodemailer'

export async function sendMail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
  const config = useRuntimeConfig()

  const host = String(config.smtpHost || '').trim()
  if (!host) {
    throw createError({
      statusCode: 503,
      statusMessage: 'SMTP non configuré (SMTP_HOST manquant).',
    })
  }

  const port = Number(config.smtpPort) || 1025
  const user = String(config.smtpUser || '').trim()
  const pass = String(config.smtpPass || '').trim()
  const from = String(config.emailFrom || '').trim()
    || (user ? `EduPulse <${user}>` : 'EduPulse <noreply@edupulselms.eu>')

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    // Mailpit / Maildev: no auth required
    ...(user && pass ? { auth: { user, pass } } : {}),
    tls: {
      rejectUnauthorized: false,
    },
  })

  await transporter.sendMail({
    from,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  })
}
