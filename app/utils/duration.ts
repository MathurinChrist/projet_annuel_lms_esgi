export function parseDurationMinutes(value: string | null | undefined): number {
  if (!value || value === '-') return 0
  const match = value.match(/(\d+)\s*min/)
  return match ? parseInt(match[1]) : 0
}

export function formatDuration(totalMinutes: number): string {
  if (!totalMinutes) return '-'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}
