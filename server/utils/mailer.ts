import nodemailer from 'nodemailer'

export async function sendMail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
  const config = useRuntimeConfig()

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: Number(config.smtpPort) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  })

  await transporter.sendMail({
    from: `"EduPulse" <${config.smtpUser}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  })
}
