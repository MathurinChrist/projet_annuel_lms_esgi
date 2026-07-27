export default defineEventHandler(async (event) => {
  const moduleId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const last = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  // Normalize to lowercase to match seed + student quiz filters
  const type = String(body.type || 'text').toLowerCase()
  const isQuiz = type === 'quiz' && Array.isArray(body.questions) && body.questions.length > 0

  const lesson = await prisma.lesson.create({
    data: {
      title: body.title?.trim(),
      type,
      order: (last?.order ?? -1) + 1,
      duration: body.meta || null,
      content: body.content ?? body.videoDescription ?? null,
      url: body.videoUrl ?? null,
      videoSource: body.videoSource ?? null,
      moduleId,
    },
  })

  if (isQuiz) {
    for (let qi = 0; qi < body.questions.length; qi++) {
      const q = body.questions[qi]
      await prisma.question.create({
        data: {
          text: q.text?.trim(),
          order: qi,
          lessonId: lesson.id,
          options: {
            create: (q.options || []).map((o: any, oi: number) => ({
              text: o.text?.trim(),
              isCorrect: !!o.isCorrect,
              order: oi,
            })),
          },
        },
      })
    }
  }

  return prisma.lesson.findUnique({
    where: { id: lesson.id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  })
})
