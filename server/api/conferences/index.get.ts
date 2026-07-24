
export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth

  const conferences = await prisma.conference.findMany({
    where: { status: { in: ['PENDING', 'LIVE'] } },
    orderBy: { scheduledAt: 'asc' },
    include: {
      author: { select: { firstName: true, lastName: true } },
      _count: { select: { registrations: true } },
      registrations: {
        where: { userId: auth.userId },
        select: { id: true },
      },
    },
  })

  return conferences.map((c) => ({
    ...c,
    isRegistered: c.registrations.length > 0,
    registrations: undefined,
  }))
})
