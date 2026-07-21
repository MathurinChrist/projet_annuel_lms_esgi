export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const userId = auth.userId
  const body = await readBody(event)
  const targetId = Number(body.userId)

  if (!targetId || targetId === userId) {
    throw createError({ statusCode: 400, statusMessage: 'Destinataire invalide' })
  }

  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } })
  if (!target) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })

  const [u1, u2] = [Math.min(userId, targetId), Math.max(userId, targetId)]

  const conversation = await prisma.conversation.upsert({
    where: { userAId_userBId: { userAId: u1, userBId: u2 } },
    create: { userAId: u1, userBId: u2 },
    update: {},
    include: {
      userA: { select: { id: true, firstName: true, lastName: true, role: true } },
      userB: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  })

  return {
    id: conversation.id,
    other: conversation.userAId === userId ? conversation.userB : conversation.userA,
    lastMessage: null,
    unreadCount: 0,
    updatedAt: conversation.updatedAt,
  }
})
