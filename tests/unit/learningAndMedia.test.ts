import { describe, it, expect } from 'vitest'
import { extractYouTubeId, isYouTubeUrl, toEmbedUrl } from '../../app/utils/videoEmbed'
import { toSlug } from '../../server/utils/slug'
import { buildLearningAccess } from '../../server/utils/learningGate'

describe('videoEmbed (unit)', () => {
  it('extrait un ID YouTube depuis plusieurs formats', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeId('not-a-url')).toBeNull()
  })

  it('détecte une URL YouTube', () => {
    expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
    expect(isYouTubeUrl('https://example.com')).toBe(false)
  })

  it('construit une URL d’embed', () => {
    expect(toEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    )
    expect(toEmbedUrl('https://vimeo.com/123456')).toBe('https://player.vimeo.com/video/123456')
  })
})

describe('slug (unit)', () => {
  it('normalise un titre en slug', () => {
    expect(toSlug('Maîtriser Figma de A à Z')).toBe('maitriser-figma-de-a-a-z')
    expect(toSlug('Hello   World!!')).toBe('hello-world')
  })
})

describe('learningGate (unit)', () => {
  const modules = [
    {
      id: 1,
      title: 'Module 1',
      order: 1,
      lessons: [
        { id: 10, type: 'video', moduleId: 1 },
        { id: 11, type: 'quiz', moduleId: 1 },
      ],
    },
    {
      id: 2,
      title: 'Module 2',
      order: 2,
      lessons: [
        { id: 20, type: 'video', moduleId: 2 },
        { id: 21, type: 'quiz', moduleId: 2 },
      ],
    },
  ]

  it('verrouille le quiz tant que les vidéos du module ne sont pas faites', () => {
    const access = buildLearningAccess(modules, new Set())
    const quiz1 = access.lessonAccess.find(l => l.lessonId === 11)
    expect(quiz1?.locked).toBe(true)
    expect(quiz1?.lockReason).toMatch(/vidéos/i)
  })

  it('débloque le module suivant après validation du quiz', () => {
    const completed = new Set([10, 11])
    const access = buildLearningAccess(modules, completed)
    const video2 = access.lessonAccess.find(l => l.lessonId === 20)
    expect(video2?.locked).toBe(false)
    expect(access.finalQuizUnlocked).toBe(false)
  })

  it('débloque l’examen final quand tous les modules sont validés', () => {
    const completed = new Set([10, 11, 20, 21])
    const access = buildLearningAccess(modules, completed)
    expect(access.finalQuizUnlocked).toBe(true)
  })
})
