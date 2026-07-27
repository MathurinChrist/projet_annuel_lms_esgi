export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const lessonId = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ answers: Record<string, number> }>(event)

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      type: true,
      moduleId: true,
      module: {
        select: {
          id: true,
          courseId: true,
          course: {
            select: {
              title: true,
              modules: {
                orderBy: { order: 'asc' },
                include: {
                  lessons: {
                    orderBy: { order: 'asc' },
                    select: { id: true, type: true, moduleId: true },
                  },
                },
              },
            },
          },
        },
      },
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  })
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })
  if (String(lesson.type).toLowerCase() !== 'quiz') {
    throw createError({ statusCode: 400, statusMessage: 'Cette leçon n’est pas un quiz.' })
  }

  const courseId = lesson.module.courseId
  const orderedModules = lesson.module.course.modules.map((m, idx) => ({
    id: m.id,
    title: '',
    order: idx,
    lessons: m.lessons.map(l => ({ id: l.id, type: l.type, moduleId: m.id })),
  }))

  const progressRows = await prisma.lessonProgress.findMany({
    where: { userId, lesson: { module: { courseId } } },
    select: { lessonId: true },
  })
  const completedIds = new Set(progressRows.map(p => p.lessonId))

  assertLessonUnlocked(orderedModules, completedIds, lessonId)

  const answers = body?.answers || {}
  const results = lesson.questions.map(q => {
    const correctOption = q.options.find(o => o.isCorrect)
    const selectedOptionId = answers[String(q.id)] ?? null
    const selectedOption = q.options.find(o => o.id === selectedOptionId)
    return {
      questionId: q.id,
      questionText: q.text,
      selectedOptionId,
      selectedText: selectedOption?.text ?? null,
      correctOptionId: correctOption?.id ?? null,
      correctText: correctOption?.text ?? null,
      isCorrect: selectedOptionId != null && selectedOptionId === correctOption?.id,
    }
  })

  const score = results.filter(r => r.isCorrect).length
  const total = lesson.questions.length
  const percentage = quizPercentage(score, total)
  const passed = isQuizPassed(score, total)

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
  })

  let explanations: Array<{ questionId: number; question: string; explanation: string }> = []
  let videosReset: number[] = []

  if (passed) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {},
      create: { userId, lessonId },
    })
  } else {
    await prisma.lessonProgress.deleteMany({ where: { userId, lessonId } })

    const moduleLessons = await prisma.lesson.findMany({
      where: { moduleId: lesson.moduleId },
      select: { id: true, type: true },
    })
    const videoIds = moduleLessons
      .filter(l => String(l.type).toLowerCase() === 'video')
      .map(l => l.id)

    if (videoIds.length) {
      await prisma.lessonProgress.deleteMany({
        where: { userId, lessonId: { in: videoIds } },
      })
      videosReset = videoIds
    }

    const wrong = results.filter(r => !r.isCorrect && r.correctText)
    try {
      const aiExplanations = await explainWrongAnswers({
        courseTitle: lesson.module.course.title,
        lessonTitle: lesson.title,
        wrongItems: wrong.map(w => ({
          question: w.questionText,
          selectedAnswer: w.selectedText || '(sans réponse)',
          correctAnswer: w.correctText!,
        })),
      })
      explanations = wrong.map((w, i) => ({
        questionId: w.questionId,
        question: w.questionText,
        explanation: aiExplanations[i]?.explanation || '',
      }))
    } catch {
      explanations = wrong.map(w => ({
        questionId: w.questionId,
        question: w.questionText,
        explanation: `La réponse « ${w.selectedText} » est incorrecte. La bonne réponse est « ${w.correctText} ». Revoir les vidéos du module avant de retenter le quiz.`,
      }))
    }
  }

  const progress = await recalculateEnrollmentProgress(userId, courseId)

  const freshProgress = await prisma.lessonProgress.findMany({
    where: { userId, lesson: { module: { courseId } } },
    select: { lessonId: true },
  })
  const freshCompleted = new Set(freshProgress.map(p => p.lessonId))
  const access = buildLearningAccess(orderedModules, freshCompleted)

  return {
    score,
    total,
    percentage,
    passed,
    passThreshold: QUIZ_PASS_THRESHOLD,
    results: results.map(r => ({
      questionId: r.questionId,
      selectedOptionId: r.selectedOptionId,
      correctOptionId: r.correctOptionId,
      isCorrect: r.isCorrect,
    })),
    explanations,
    videosReset,
    completedLessonIds: [...freshCompleted],
    access,
    progress,
  }
})
