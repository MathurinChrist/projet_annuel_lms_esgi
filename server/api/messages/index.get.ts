export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const userId = auth.userId

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      userA: { select: { id: true, firstName: true, lastName: true, role: true } },
      userB: { select: { id: true, firstName: true, lastName: true, role: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, content: true, senderId: true, createdAt: true },
      },
      _count: {
        select: {
          messages: { where: { readAt: null, senderId: { not: userId } } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return conversations.map((conv) => ({
    id: conv.id,
    other: conv.userAId === userId ? conv.userB : conv.userA,
    lastMessage: conv.messages[0] ?? null,
    unreadCount: conv._count.messages,
    updatedAt: conv.updatedAt,
  }))
})
