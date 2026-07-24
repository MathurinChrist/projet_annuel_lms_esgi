
export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth

  const conferences = await prisma.conference.findMany({
    where: { authorId: auth.userId },
    orderBy: { scheduledAt: 'asc' },
    include: {
      _count: { select: { registrations: true } },
    },
  })

  return conferences
})
