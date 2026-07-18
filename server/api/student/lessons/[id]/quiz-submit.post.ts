export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const lessonId = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ answers: Record<string, number> }>(event)

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      module: { select: { courseId: true } },
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  })
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })

  const courseId = lesson.module.courseId
  const answers = body?.answers || {}

  const results = lesson.questions.map(q => {
    const correctOption = q.options.find(o => o.isCorrect)
    const selectedOptionId = answers[String(q.id)] ?? null
    return {
      questionId: q.id,
      selectedOptionId,
      correctOptionId: correctOption?.id ?? null,
      isCorrect: selectedOptionId != null && selectedOptionId === correctOption?.id,
    }
  })

  const score = results.filter(r => r.isCorrect).length

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
  })

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {},
    create: { userId, lessonId },
  })

  const progress = await recalculateEnrollmentProgress(userId, courseId)

  return { score, total: lesson.questions.length, results, progress }
})
