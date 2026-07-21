export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const userId = auth.userId
  const convId = Number(getRouterParam(event, 'id'))

  const conversation = await prisma.conversation.findUnique({ where: { id: convId } })
  if (!conversation || (conversation.userAId !== userId && conversation.userBId !== userId)) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  await prisma.message.updateMany({
    where: { conversationId: convId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  })

  return prisma.message.findMany({
    where: { conversationId: convId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, content: true, senderId: true, createdAt: true, readAt: true },
  })
})
