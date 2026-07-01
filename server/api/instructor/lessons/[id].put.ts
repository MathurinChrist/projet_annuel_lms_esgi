export default defineEventHandler(async (event) => {
  const lessonId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title: body.title?.trim() ?? undefined,
      duration: body.meta ?? undefined,
      content: body.content ?? body.videoDescription ?? undefined,
      url: body.videoUrl ?? undefined,
      videoSource: body.videoSource ?? undefined,
      order: body.order ?? undefined,
    },
    select: { type: true },
  })

  if (lesson.type === 'QUIZ' && Array.isArray(body.questions)) {
    await prisma.question.deleteMany({ where: { lessonId } })
    for (let qi = 0; qi < body.questions.length; qi++) {
      const q = body.questions[qi]
      await prisma.question.create({
        data: {
          text: q.text?.trim(),
          order: qi,
          lessonId,
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
    where: { id: lessonId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  })
})
