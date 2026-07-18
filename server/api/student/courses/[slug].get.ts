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

  return {
    ...course,
    modules: course.modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => ({ ...l, completed: completedIds.has(l.id) })),
    })),
    progress: enrollment.progress,
  }
})
