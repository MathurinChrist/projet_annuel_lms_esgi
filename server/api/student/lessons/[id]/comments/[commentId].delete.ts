export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const lessonId = Number(getRouterParam(event, 'id'))
  const commentId = Number(getRouterParam(event, 'commentId'))

  const comment = await prisma.lessonComment.findUnique({ where: { id: commentId } })
  if (!comment || comment.lessonId !== lessonId) {
    throw createError({ statusCode: 404, statusMessage: 'Message introuvable' })
  }
  if (comment.userId !== userId) {
    throw createError({ statusCode: 403, statusMessage: "Vous ne pouvez supprimer que vos propres messages" })
  }

  await prisma.lessonComment.delete({ where: { id: commentId } })

  return { deleted: true }
})
