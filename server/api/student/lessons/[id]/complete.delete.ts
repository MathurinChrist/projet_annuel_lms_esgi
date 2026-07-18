export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const lessonId = Number(getRouterParam(event, 'id'))

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { courseId: true } } },
  })
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })

  const courseId = lesson.module.courseId

  await prisma.lessonProgress.deleteMany({
    where: { userId, lessonId },
  })

  const progress = await recalculateEnrollmentProgress(userId, courseId)

  return { completed: false, progress }
})
