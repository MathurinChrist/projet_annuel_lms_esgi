/** Templates HTML emails transactionnels EduPulse */

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function emailShell(opts: {
  preheader: string
  eyebrow: string
  title: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
  footerNote?: string
}) {
  const year = new Date().getFullYear()
  const cta = opts.ctaLabel && opts.ctaUrl
    ? `<div style="text-align:center;margin:0 0 28px;">
        <a href="${escapeHtml(opts.ctaUrl)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.01em;">
          ${escapeHtml(opts.ctaLabel)}
        </a>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EduPulse</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:36px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#0f172a;padding:28px 36px;text-align:left;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;width:36px;height:36px;border-radius:10px;background:#1d4ed8;color:#fff;font-weight:800;font-size:16px;line-height:36px;text-align:center;vertical-align:middle;">E</span>
                  <span style="display:inline-block;margin-left:10px;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.02em;vertical-align:middle;">EduPulse</span>
                </td>
                <td align="right" style="color:#94a3b8;font-size:12px;font-weight:600;">LMS</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 36px 8px;">
            <p style="margin:0 0 8px;color:#1d4ed8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(opts.eyebrow)}</p>
            <h1 style="margin:0 0 20px;color:#0f172a;font-size:26px;line-height:1.25;font-weight:800;">${escapeHtml(opts.title)}</h1>
            ${opts.bodyHtml}
            ${cta}
            ${opts.footerNote
              ? `<p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.6;">${opts.footerNote}</p>`
              : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;text-align:center;">
              © ${year} EduPulse — Cet email a été envoyé automatiquement.<br />
              Si vous n’êtes pas à l’origine de cette demande, ignorez simplement ce message.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function formatPersonName(opts: {
  firstName?: string | null
  lastName?: string | null
  email: string
}) {
  const first = String(opts.firstName || '').trim()
  const last = String(opts.lastName || '').trim()
  const full = [first, last].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  if (full) return full
  const local = String(opts.email || '').split('@')[0]?.trim()
  return local || opts.email
}

export function buildPasswordResetEmail(opts: {
  firstName?: string | null
  lastName?: string | null
  email: string
  resetUrl: string
  expiresInMinutes?: number
}) {
  const minutes = opts.expiresInMinutes ?? 60
  const displayName = formatPersonName(opts)
  const nameHtml = escapeHtml(displayName)

  const html = emailShell({
    preheader: `Réinitialisez votre mot de passe EduPulse (valide ${minutes} min)`,
    eyebrow: 'Sécurité du compte',
    title: 'Réinitialisation du mot de passe',
    bodyHtml: `
      <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.65;">
        Bonjour <strong style="color:#0f172a;">${nameHtml}</strong>,
      </p>
      <p style="margin:0 0 22px;color:#334155;font-size:15px;line-height:1.65;">
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte
        <strong style="color:#0f172a;">${escapeHtml(opts.email)}</strong>.
        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
      </p>
      <div style="margin:0 0 24px;padding:16px 18px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
        <p style="margin:0;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Validité du lien</p>
        <p style="margin:6px 0 0;color:#0f172a;font-size:15px;font-weight:700;">${minutes} minutes</p>
      </div>
    `,
    ctaLabel: 'Choisir un nouveau mot de passe',
    ctaUrl: opts.resetUrl,
    footerNote: `Le lien ne fonctionne pas&nbsp;? Copiez-collez cette adresse dans votre navigateur&nbsp;:<br />
      <a href="${escapeHtml(opts.resetUrl)}" style="color:#1d4ed8;word-break:break-all;font-size:12px;">${escapeHtml(opts.resetUrl)}</a>`,
  })

  const text = [
    `Bonjour ${displayName},`,
    '',
    `Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte ${opts.email}.`,
    `Ouvrez ce lien (valide ${minutes} minutes) :`,
    opts.resetUrl,
    '',
    "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.",
    '',
    '— EduPulse',
  ].join('\n')

  return {
    subject: 'Réinitialisez votre mot de passe — EduPulse',
    html,
    text,
  }
}

export function getAppBaseUrl() {
  // Prefer runtime env: Nuxt may bake appUrl=localhost at image build time.
  const fromEnv = String(
    process.env.APP_URL
    || process.env.NUXT_APP_URL
    || '',
  ).trim()
  const config = useRuntimeConfig()
  const fromConfig = String((config as any).appUrl || '').trim()
  const base = fromEnv || fromConfig || 'http://localhost:3000'
  return base.replace(/\/$/, '')
}
