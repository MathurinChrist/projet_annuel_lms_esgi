export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const userId = auth.userId

  const count = await prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    },
  })

  return { count }
})
