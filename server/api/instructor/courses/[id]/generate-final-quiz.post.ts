export default defineEventHandler(async (event) => {
  ensureTrainer(event)

  const courseId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const questionCount = Number(body?.questionCount) || 8

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              questions: {
                orderBy: { order: 'asc' },
                include: { options: { orderBy: { order: 'asc' } } },
              },
            },
          },
        },
      },
    },
  })

  if (!course) {
    throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
  }

  const quiz = await generateFinalQuizFromModules({
    courseTitle: course.title,
    questionCount,
    modules: course.modules.map(m => ({
      title: m.title,
      lessons: m.lessons.map(l => ({
        title: l.title,
        type: l.type,
        content: l.content,
        questions: l.questions.map(q => ({
          text: q.text,
          options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
        })),
      })),
    })),
  })

  await prisma.finalQuizQuestion.deleteMany({ where: { courseId } })

  for (let qi = 0; qi < quiz.questions.length; qi++) {
    const q = quiz.questions[qi]
    await prisma.finalQuizQuestion.create({
      data: {
        text: q.text,
        order: qi,
        courseId,
        options: {
          create: q.options.map((o, oi) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            order: oi,
          })),
        },
      },
    })
  }

  const saved = await prisma.finalQuizQuestion.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    include: { options: { orderBy: { order: 'asc' } } },
  })

  return {
    title: quiz.title,
    questionCount: saved.length,
    questions: saved,
  }
})
