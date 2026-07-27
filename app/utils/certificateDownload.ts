/**
 * Download a certificate PDF via authenticated fetch + blob save.
 * Returns an error message string on failure, or null on success.
 */
export async function downloadCertificatePdfFile(code: string, token?: string | null): Promise<string | null> {
  const res = await fetch(`/api/student/certificates/${encodeURIComponent(code)}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok) {
    let message = 'Le téléchargement du PDF a échoué. Réessayez.'
    try {
      const err = await res.json()
      message = err?.message || err?.statusMessage || message
    } catch {
      /* ignore */
    }
    return message
  }

  const blob = await res.blob()
  const type = blob.type || ''
  if (!blob.size || type.includes('json') || type.includes('html') || type.includes('text')) {
    return 'Réponse PDF invalide. Rechargez la page puis réessayez.'
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Certificat-${code}.pdf`.replace(/[^\w.-]+/g, '_')
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
  return null
}
