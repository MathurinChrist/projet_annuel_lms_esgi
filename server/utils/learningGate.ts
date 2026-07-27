export type GateLesson = {
  id: number
  type: string
  title?: string
  moduleId?: number
}

export type GateModule = {
  id: number
  title: string
  order: number
  lessons: GateLesson[]
}

export type LessonAccess = {
  lessonId: number
  moduleId: number
  locked: boolean
  lockReason: string | null
}

function isQuiz(type: string) {
  return String(type).toLowerCase() === 'quiz'
}

function isVideo(type: string) {
  return String(type).toLowerCase() === 'video'
}

/**
 * Progression rules:
 * - Module N is locked until previous module's quiz is passed (or all videos done if no quiz).
 * - Module quiz is locked until all videos in that module are completed.
 * - Final quiz unlocks when every module is cleared.
 */
export function buildLearningAccess(modules: GateModule[], completedIds: Set<number>) {
  const sorted = [...modules].sort((a, b) => a.order - b.order)
  const lessonAccess: LessonAccess[] = []
  const moduleStates: Array<{
    moduleId: number
    unlocked: boolean
    videosDone: boolean
    quizPassed: boolean
    cleared: boolean
    lockReason: string | null
  }> = []

  let previousCleared = true

  for (const mod of sorted) {
    const videos = mod.lessons.filter(l => isVideo(l.type))
    const quizzes = mod.lessons.filter(l => isQuiz(l.type))
    const videosDone = videos.length === 0 || videos.every(v => completedIds.has(v.id))
    const quizPassed = quizzes.length === 0 || quizzes.every(q => completedIds.has(q.id))
    const cleared = quizzes.length > 0 ? quizPassed : videosDone
    const unlocked = previousCleared
    const moduleLockReason = unlocked
      ? null
      : 'Validez le quiz du module précédent (min. 70 %) pour débloquer celui-ci.'

    for (const lesson of mod.lessons) {
      let locked = !unlocked
      let lockReason = moduleLockReason

      if (unlocked && isQuiz(lesson.type) && !videosDone) {
        locked = true
        lockReason = 'Visionnez toutes les vidéos de ce module avant de passer le quiz.'
      }

      lessonAccess.push({
        lessonId: lesson.id,
        moduleId: mod.id,
        locked,
        lockReason,
      })
    }

    moduleStates.push({
      moduleId: mod.id,
      unlocked,
      videosDone,
      quizPassed,
      cleared: unlocked && cleared,
      lockReason: moduleLockReason,
    })

    previousCleared = previousCleared && cleared
  }

  const finalQuizUnlocked = previousCleared
  const finalQuizLockReason = finalQuizUnlocked
    ? null
    : 'Validez tous les quiz de modules (min. 70 %) avant l’examen final.'

  return {
    lessonAccess,
    moduleStates,
    finalQuizUnlocked,
    finalQuizLockReason,
    accessByLessonId: Object.fromEntries(lessonAccess.map(a => [a.lessonId, a])),
  }
}

export function assertLessonUnlocked(
  modules: GateModule[],
  completedIds: Set<number>,
  lessonId: number,
) {
  const { accessByLessonId } = buildLearningAccess(modules, completedIds)
  const access = accessByLessonId[lessonId]
  if (!access) {
    throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })
  }
  if (access.locked) {
    throw createError({
      statusCode: 403,
      statusMessage: access.lockReason || 'Cette leçon est verrouillée.',
    })
  }
  return access
}
