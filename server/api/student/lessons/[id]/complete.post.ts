export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const lessonId = Number(getRouterParam(event, 'id'))

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      type: true,
      module: {
        select: {
          courseId: true,
          course: {
            select: {
              modules: {
                orderBy: { order: 'asc' },
                include: {
                  lessons: {
                    orderBy: { order: 'asc' },
                    select: { id: true, type: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })

  if (String(lesson.type).toLowerCase() === 'quiz') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le quiz se valide uniquement en soumettant vos réponses.',
    })
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
  assertLessonUnlocked(orderedModules, new Set(progressRows.map(p => p.lessonId)), lessonId)

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

  return { completed: true, progress }
})
