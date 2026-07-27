const YOUTUBE_ID_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/

export function extractYouTubeId(url: string): string | null {
  const match = url.trim().match(YOUTUBE_ID_RE)
  return match?.[1] ?? null
}

const MAX_TRANSCRIPT_CHARS = 14_000

export async function fetchYouTubeTranscript(url: string): Promise<{
  videoId: string
  transcript: string
  language?: string
}> {
  const videoId = extractYouTubeId(url)
  if (!videoId) {
    throw createError({
      statusCode: 400,
      message: 'URL YouTube invalide. Exemple : https://www.youtube.com/watch?v=…',
    })
  }

  try {
    const { fetchTranscript } = await import('youtube-transcript')
    let items = await fetchTranscript(videoId, { lang: 'fr' }).catch(() => null)
    if (!items?.length) {
      items = await fetchTranscript(videoId)
    }

    if (!items?.length) {
      throw createError({
        statusCode: 422,
        message: 'Aucune transcription disponible pour cette vidéo (sous-titres désactivés ou absents).',
      })
    }

    const transcript = items
      .map((item) => item.text?.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join(' ')
      .slice(0, MAX_TRANSCRIPT_CHARS)

    if (transcript.length < 80) {
      throw createError({
        statusCode: 422,
        message: 'La transcription est trop courte pour générer un quiz pertinent.',
      })
    }

    return { videoId, transcript }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({
      statusCode: 502,
      message: err?.message
        ? `Impossible de récupérer la transcription : ${err.message}`
        : 'Impossible de récupérer la transcription YouTube.',
    })
  }
}
