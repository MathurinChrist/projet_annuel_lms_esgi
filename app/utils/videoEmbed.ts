const YOUTUBE_ID_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(YOUTUBE_ID_RE)
  return match?.[1] ?? null
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return !!extractYouTubeId(url)
}

export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null

  const youtubeId = extractYouTubeId(url)
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return url
}
