/**
 * Équipe de développement EduPulse LMS (projet annuel ESGI).
 * Modifiez ces informations pour qu’elles correspondent à votre groupe.
 */
export const CERTIFICATE_PLATFORM = {
  name: 'EduPulse LMS',
  institution: 'ESGI — École Supérieure de Génie Informatique',
  tagline: 'Plateforme de formation en ligne',
  academicYear: '2025 – 2026',
}

export type CertificateSignatory = {
  name: string
  role: string
  specialty: string
  /** CSS color for the handwritten signature style */
  ink: string
}

export const CERTIFICATE_DEVELOPERS: CertificateSignatory[] = [
  {
    name: 'Alexandre Moreau',
    role: 'Chef de projet',
    specialty: 'Architecture & coordination',
    ink: '#1e3a5f',
  },
  {
    name: 'Camille Bernard',
    role: 'Développeuse Full-Stack',
    specialty: 'Backend, API & base de données',
    ink: '#3b1f5e',
  },
  {
    name: 'Hugo Lefèvre',
    role: 'Développeur Full-Stack',
    specialty: 'Frontend, UX & parcours apprenant',
    ink: '#1a4d3e',
  },
  {
    name: 'Sarah Nguyen',
    role: 'Ingénieure Qualité & DevOps',
    specialty: 'Tests, CI/CD & déploiement',
    ink: '#5c2a1a',
  },
]

export function difficultyBaseLevel(difficulty: string): { level: string; label: string } {
  const d = String(difficulty || 'BEGINNER').toUpperCase()
  if (d === 'ADVANCED' || d === 'EXPERT') {
    return { level: 'AVANCE', label: 'Niveau Avancé' }
  }
  if (d === 'INTERMEDIATE') {
    return { level: 'INTERMEDIAIRE', label: 'Niveau Intermédiaire' }
  }
  return { level: 'INITIATION', label: 'Niveau Initiation' }
}

export function resolveCertificateLevel(difficulty: string, scorePercent?: number | null) {
  const base = difficultyBaseLevel(difficulty)
  let mention: string | null = null
  let level = base.level
  let label = base.label

  if (scorePercent != null) {
    if (scorePercent >= 95) {
      mention = 'Mention Excellent'
      if (level === 'INITIATION') {
        level = 'INTERMEDIAIRE'
        label = 'Niveau Intermédiaire'
      } else if (level === 'INTERMEDIAIRE') {
        level = 'AVANCE'
        label = 'Niveau Avancé'
      } else {
        level = 'EXPERT'
        label = 'Niveau Expert'
      }
    } else if (scorePercent >= 85) {
      mention = 'Mention Très Bien'
    } else if (scorePercent >= 75) {
      mention = 'Mention Bien'
    } else {
      mention = 'Mention Assez Bien'
    }
  }

  return { level, label, mention }
}

export function generateCertificateCode(courseId: number, userId: number) {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  return `EDU-${courseId}-${userId}-${stamp}`
}

/** Parse lesson duration strings like "25 min" → minutes. */
export function parseDurationMinutes(value: string | null | undefined): number {
  if (!value || value === '-') return 0
  const match = String(value).match(/(\d+)\s*min/i)
  if (match) return parseInt(match[1], 10)
  const hours = String(value).match(/(\d+)\s*h/i)
  if (hours) return parseInt(hours[1], 10) * 60
  return 0
}

export function formatDurationLabel(totalMinutes: number): string {
  if (!totalMinutes) return '—'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0 && m > 0) return `${h} h ${m} min`
  if (h > 0) return `${h} h`
  return `${m} min`
}

export function sumCourseDurationMinutes(
  modules: Array<{ lessons?: Array<{ duration?: string | null }> | null }> | null | undefined,
): number {
  if (!modules?.length) return 0
  return modules.reduce((sum, mod) => {
    const lessons = mod.lessons || []
    return sum + lessons.reduce((s, l) => s + parseDurationMinutes(l.duration), 0)
  }, 0)
}

