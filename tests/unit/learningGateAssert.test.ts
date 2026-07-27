import { describe, it, expect } from 'vitest'
import { assertLessonUnlocked, buildLearningAccess } from '../../server/utils/learningGate'

const modules = [
  {
    id: 1,
    title: 'M1',
    order: 1,
    lessons: [
      { id: 1, type: 'video', moduleId: 1 },
      { id: 2, type: 'quiz', moduleId: 1 },
    ],
  },
]

describe('assertLessonUnlocked (unit)', () => {
  it('lève 404 si la leçon est inconnue', () => {
    try {
      assertLessonUnlocked(modules, new Set(), 999)
      expect.unreachable()
    } catch (e: any) {
      expect(e.statusCode).toBe(404)
    }
  })

  it('lève 403 si le quiz est verrouillé', () => {
    try {
      assertLessonUnlocked(modules, new Set(), 2)
      expect.unreachable()
    } catch (e: any) {
      expect(e.statusCode).toBe(403)
    }
  })

  it('autorise une vidéo du premier module', () => {
    const access = assertLessonUnlocked(modules, new Set(), 1)
    expect(access.locked).toBe(false)
  })

  it('buildLearningAccess marque le module 2 verrouillé sans quiz 1', () => {
    const mods = [
      ...modules,
      {
        id: 2,
        title: 'M2',
        order: 2,
        lessons: [{ id: 3, type: 'video', moduleId: 2 }],
      },
    ]
    const { lessonAccess } = buildLearningAccess(mods, new Set([1]))
    expect(lessonAccess.find(l => l.lessonId === 3)?.locked).toBe(true)
  })
})
