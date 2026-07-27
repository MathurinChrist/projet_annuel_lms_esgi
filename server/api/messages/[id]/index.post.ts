export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const userId = auth.userId
  const convId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const content = String(body.content ?? '').trim()

  if (!content) throw createError({ statusCode: 400, statusMessage: 'Le message ne peut pas être vide' })

  const conversation = await prisma.conversation.findUnique({ where: { id: convId } })
  if (!conversation || (conversation.userAId !== userId && conversation.userBId !== userId)) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  const message = await prisma.message.create({
    data: { conversationId: convId, senderId: userId, content },
    select: { id: true, content: true, senderId: true, createdAt: true, readAt: true },
  })

  await prisma.conversation.update({ where: { id: convId }, data: { updatedAt: new Date() } })

  const recipientId = conversation.userAId === userId ? conversation.userBId : conversation.userAId
  const peer = wsClients.get(recipientId)
  if (peer) {
    peer.send(JSON.stringify({ type: 'message', conversationId: convId, message }))
  }

  return message
})
