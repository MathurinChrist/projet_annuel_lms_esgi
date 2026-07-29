const YOUTUBE_ID_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/

export const MAX_TRANSCRIPT_CHARS = 14_000

export function extractYouTubeId(url: string): string | null {
  const match = url.trim().match(YOUTUBE_ID_RE)
  return match?.[1] ?? null
}

export function normalizeTranscriptText(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TRANSCRIPT_CHARS)
}

function isIpBlockedError(raw: string): boolean {
  return /disabled on this video|requestblocked|ipblocked|too many requests|429|sign in to confirm|bot|forbidden|captcha|login_required/i.test(raw)
}

function transcriptError(code: string, statusCode: number, message: string) {
  return createError({
    statusCode,
    statusMessage: message,
    message,
    data: { code },
  })
}

export async function fetchYouTubeTranscript(url: string): Promise<{
  videoId: string
  transcript: string
  language?: string
}> {
  const videoId = extractYouTubeId(url)
  if (!videoId) {
    throw transcriptError(
      'INVALID_URL',
      400,
      'URL YouTube invalide. Exemple : https://www.youtube.com/watch?v=…',
    )
  }

  try {
    const { fetchTranscript } = await import('youtube-transcript')
    const langCandidates = ['fr', 'en', 'en-US', 'en-GB', 'es', 'de', 'it', 'pt']
    let items: Array<{ text?: string }> | null = null
    let lastError: unknown = null

    for (const lang of langCandidates) {
      try {
        const batch = await fetchTranscript(videoId, { lang })
        if (batch?.length) {
          items = batch
          break
        }
      } catch (err) {
        lastError = err
      }
    }

    if (!items?.length) {
      try {
        items = await fetchTranscript(videoId)
      } catch (err) {
        lastError = err
      }
    }

    if (!items?.length) {
      const raw = String((lastError as any)?.message || lastError || '')
      if (isIpBlockedError(raw)) {
        throw transcriptError(
          'YOUTUBE_IP_BLOCKED',
          422,
          'YouTube bloque la récupération automatique des sous-titres depuis ce serveur (IP datacenter). Collez la transcription manuellement, ou ajoutez GEMINI_API_KEY pour générer le quiz directement depuis la vidéo.',
        )
      }
      throw transcriptError(
        'TRANSCRIPT_UNAVAILABLE',
        422,
        'Aucune transcription disponible pour cette vidéo (sous-titres absents ou non récupérables).',
      )
    }

    const transcript = normalizeTranscriptText(
      items.map((item) => item.text?.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' '),
    )

    if (transcript.length < 80) {
      throw transcriptError(
        'TRANSCRIPT_TOO_SHORT',
        422,
        'La transcription est trop courte pour générer un quiz pertinent.',
      )
    }

    return { videoId, transcript }
  } catch (err: any) {
    if (err?.statusCode) throw err
    const raw = String(err?.message || '')
    if (isIpBlockedError(raw)) {
      throw transcriptError(
        'YOUTUBE_IP_BLOCKED',
        422,
        'YouTube bloque la récupération automatique des sous-titres depuis ce serveur (IP datacenter). Collez la transcription manuellement, ou ajoutez GEMINI_API_KEY pour générer le quiz directement depuis la vidéo.',
      )
    }
    throw transcriptError(
      'TRANSCRIPT_FETCH_FAILED',
      502,
      raw
        ? `Impossible de récupérer la transcription : ${raw}`
        : 'Impossible de récupérer la transcription YouTube.',
    )
  }
}
