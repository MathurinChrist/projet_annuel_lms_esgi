export default defineTask({
  meta: {
    name: 'conferences:reminders',
    description: 'Envoie les rappels email 15 min avant les conférences',
  },

  async run() {
    const now = new Date()
    // Fenêtre non-chevauchante : on cherche les conférences entre now+10min et now+15min
    // La tâche tourne toutes les 5min → chaque conférence ne tombera dans la fenêtre qu'une fois
    const windowStart = new Date(now.getTime() + 10 * 60 * 1000)
    const windowEnd = new Date(now.getTime() + 15 * 60 * 1000)

    const conferences = await prisma.conference.findMany({
      where: {
        scheduledAt: { gte: windowStart, lte: windowEnd },
        status: { notIn: ['ENDED', 'CANCELLED'] },
      },
      include: {
        registrations: {
          include: {
            user: { select: { email: true, firstName: true, lastName: true } },
          },
        },
        author: { select: { firstName: true, lastName: true } },
      },
    })

    let sent = 0
    for (const conf of conferences) {
      for (const reg of conf.registrations) {
        try {
          await sendMail({
            to: reg.user.email,
            subject: `⏰ Rappel – "${conf.title}" commence dans 15 minutes`,
            html: buildReminderHtml(conf, reg.user),
          })
          sent++
        } catch (err) {
          console.error(`[reminders] Échec envoi à ${reg.user.email}:`, err)
        }
      }
    }

    return { result: `${conferences.length} conférence(s) — ${sent} rappel(s) envoyé(s)` }
  },
})

function buildReminderHtml(conf: any, user: any) {
  const name = user.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user.email

  const time = new Date(conf.scheduledAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const date = new Date(conf.scheduledAt).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const instructor = conf.author.firstName
    ? `${conf.author.firstName} ${conf.author.lastName || ''}`.trim()
    : 'Votre formateur'

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:40px 48px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🎓</div>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">EduPulse</h1>
            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Votre plateforme d'apprentissage</p>
          </td>
        </tr>

        <tr>
          <td style="padding:48px;">
            <p style="margin:0 0 8px;color:#64748b;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Rappel de conférence</p>
            <h2 style="margin:0 0 32px;color:#0f172a;font-size:28px;font-weight:700;">Dans 15 minutes !</h2>

            <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
              Bonjour <strong style="color:#0f172a;">${name}</strong>,<br>
              La conférence à laquelle vous êtes inscrit(e) commence très bientôt.
            </p>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <span style="display:block;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Conférence</span>
                    <span style="color:#0f172a;font-size:18px;font-weight:700;">${conf.title}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <span style="display:block;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Formateur</span>
                    <span style="color:#475569;font-size:15px;">${instructor}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="display:block;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Heure de début</span>
                    <span style="color:#2563eb;font-size:22px;font-weight:700;">${time}</span>
                    <span style="color:#64748b;font-size:14px;margin-left:8px;">${date}</span>
                  </td>
                </tr>
              </table>
            </div>

            <div style="text-align:center;margin-bottom:32px;">
              <a href="http://localhost:3000/conferences" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:10px;font-size:16px;font-weight:600;">
                Rejoindre la conférence →
              </a>
            </div>

            <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;line-height:1.5;">
              Vous recevez cet email car vous êtes inscrit(e) à cette conférence sur EduPulse.<br>
              Assurez-vous d'avoir autorisé l'accès à votre caméra et microphone.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 48px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} EduPulse – Tous droits réservés</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
