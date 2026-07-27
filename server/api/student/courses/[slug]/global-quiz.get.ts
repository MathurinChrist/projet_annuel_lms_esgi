export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

  const { userId } = (event.context as any).auth
  const slug = getRouterParam(event, 'slug')!

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      finalQuizQuestions: {
        orderBy: { order: 'asc' },
        include: {
          options: {
            orderBy: { order: 'asc' },
            select: { id: true, text: true, order: true },
          },
        },
      },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, type: true, title: true, content: true },
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
  const access = buildLearningAccess(
    course.modules.map((m, idx) => ({
      id: m.id,
      title: m.title,
      order: idx,
      lessons: m.lessons.map(l => ({ id: l.id, type: l.type, moduleId: m.id })),
    })),
    new Set(progressRows.map(p => p.lessonId)),
  )

  if (!access.finalQuizUnlocked) {
    throw createError({
      statusCode: 403,
      statusMessage: access.finalQuizLockReason || 'Examen final verrouillé.',
    })
  }

  if (course.finalQuizQuestions.length === 0) {
    const rich = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                questions: {
                  include: { options: true },
                },
              },
            },
          },
        },
      },
    })

    if (!rich) {
      throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
    }

    const quiz = await generateFinalQuizFromModules({
      courseTitle: rich.title,
      questionCount: 8,
      modules: rich.modules.map(m => ({
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

    for (let qi = 0; qi < quiz.questions.length; qi++) {
      const q = quiz.questions[qi]
      await prisma.finalQuizQuestion.create({
        data: {
          text: q.text,
          order: qi,
          courseId: course.id,
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
      where: { courseId: course.id },
      orderBy: { order: 'asc' },
      include: {
        options: {
          orderBy: { order: 'asc' },
          select: { id: true, text: true, order: true },
        },
      },
    })

    return {
      source: 'ai',
      title: quiz.title,
      questions: saved.map(q => ({ ...q, lessonTitle: 'Examen final' })),
    }
  }

  return {
    source: 'ai',
    title: 'Examen final',
    questions: course.finalQuizQuestions.map(q => ({
      ...q,
      lessonTitle: 'Examen final',
    })),
  }
})
