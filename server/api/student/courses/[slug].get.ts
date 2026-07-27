export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

  const { userId } = (event.context as any).auth
  const slug = getRouterParam(event, 'slug')!

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { firstName: true, lastName: true } },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              questions: {
                orderBy: { order: 'asc' },
                include: { options: { orderBy: { order: 'asc' }, select: { id: true, text: true, order: true } } },
              },
            },
          },
        },
      },
      _count: { select: { finalQuizQuestions: true } },
    },
  })

  if (!course || !course.published || !course.isPublic) {
    throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    update: {},
    create: { userId, courseId: course.id },
  })

  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId, lesson: { module: { courseId: course.id } } },
    select: { lessonId: true },
  })
  const completedIds = new Set(completedLessons.map(l => l.lessonId))

  const access = buildLearningAccess(
    course.modules.map((m, idx) => ({
      id: m.id,
      title: m.title,
      order: idx,
      lessons: m.lessons.map(l => ({ id: l.id, type: l.type, moduleId: m.id })),
    })),
    completedIds,
  )

  const { _count, ...courseData } = course

  return {
    ...courseData,
    modules: course.modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => {
        const a = access.accessByLessonId[l.id]
        return {
          ...l,
          completed: completedIds.has(l.id),
          locked: a?.locked ?? false,
          lockReason: a?.lockReason ?? null,
        }
      }),
    })),
    progress: enrollment.progress,
    finalQuizUnlocked: access.finalQuizUnlocked,
    finalQuizLockReason: access.finalQuizLockReason,
    hasFinalQuiz: _count.finalQuizQuestions > 0,
  }
})
