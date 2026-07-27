export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const lessonId = Number(getRouterParam(event, 'id'))
  const commentId = Number(getRouterParam(event, 'commentId'))

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { course: { select: { authorId: true } } } } },
  })
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })
  if (lesson.module.course.authorId !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé à l\'auteur du cours' })
  }

  const comment = await prisma.lessonComment.findUnique({ where: { id: commentId } })
  if (!comment || comment.lessonId !== lessonId) {
    throw createError({ statusCode: 404, statusMessage: 'Message introuvable' })
  }

  await prisma.lessonComment.delete({ where: { id: commentId } })

  return { deleted: true }
})
