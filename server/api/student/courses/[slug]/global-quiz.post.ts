export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const slug = getRouterParam(event, 'slug')!
  const body = await readBody<{ answers: Record<string, number> }>(event)

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      finalQuizQuestions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, type: true, title: true, moduleId: true },
          },
        },
      },
    },
  })

  if (!course) {
    throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
  }

  const progressRows = await prisma.lessonProgress.findMany({
    where: { userId, lesson: { module: { courseId: course.id } } },
    select: { lessonId: true },
  })
  const completedIds = new Set(progressRows.map(p => p.lessonId))
  const access = buildLearningAccess(
    course.modules.map((m, idx) => ({
      id: m.id,
      title: m.title,
      order: idx,
      lessons: m.lessons.map(l => ({ id: l.id, type: l.type, moduleId: m.id })),
    })),
    completedIds,
  )

  if (!access.finalQuizUnlocked) {
    throw createError({
      statusCode: 403,
      statusMessage: access.finalQuizLockReason || 'Examen final verrouillé.',
    })
  }

  const questions = course.finalQuizQuestions
  const quizAnswers = body?.answers || {}

  if (questions.length === 0) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Aucun examen final disponible. Demandez au formateur de le générer, ou rouvrez cette page.',
    })
  }

  const evaluated = questions.map((q) => {
    const correctOption = q.options.find(o => o.isCorrect)
    const studentOptionId = quizAnswers[String(q.id)]
    const selected = q.options.find(o => o.id === Number(studentOptionId))
    const isCorrect = studentOptionId != null && Number(studentOptionId) === correctOption?.id
    return {
      questionId: q.id,
      text: q.text,
      isCorrect,
      correctOptionId: correctOption?.id,
      correctText: correctOption?.text,
      selectedText: selected?.text || '(sans réponse)',
      studentOptionId: studentOptionId != null ? Number(studentOptionId) : null,
    }
  })

  const total = evaluated.length
  const score = evaluated.filter(q => q.isCorrect).length
  const percentage = quizPercentage(score, total)
  const success = isQuizPassed(score, total)

  let explanations: Array<{ questionId: number; question: string; explanation: string }> = []
  let lessonsToReview: Array<{ id: number; title: string; order: number; moduleTitle: string }> = []

  if (success) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: course.id } },
      update: { progress: 100 },
      create: { userId, courseId: course.id, progress: 100 },
    })
  } else {
    const wrong = evaluated.filter(q => !q.isCorrect)
    try {
      const ai = await explainWrongAnswers({
        courseTitle: course.title,
        lessonTitle: 'Examen final',
        wrongItems: wrong.map(w => ({
          question: w.text,
          selectedAnswer: w.selectedText,
          correctAnswer: w.correctText || '',
        })),
      })
      explanations = wrong.map((w, i) => ({
        questionId: w.questionId,
        question: w.text,
        explanation: ai[i]?.explanation || '',
      }))
    } catch {
      explanations = wrong.map(w => ({
        questionId: w.questionId,
        question: w.text,
        explanation: `Incorrect. La bonne réponse était « ${w.correctText} ».`,
      }))
    }

    lessonsToReview = course.modules.flatMap(m =>
      m.lessons
        .filter(l => String(l.type).toLowerCase() === 'video')
        .map(l => ({
          id: l.id,
          title: l.title,
          order: 0,
          moduleTitle: m.title,
        })),
    )
  }

  return {
    success,
    score,
    total,
    percentage,
    passThreshold: QUIZ_PASS_THRESHOLD,
    explanations,
    lessonsToReview,
  }
})
