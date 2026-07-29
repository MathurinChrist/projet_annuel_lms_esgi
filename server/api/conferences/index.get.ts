
export default defineEventHandler(async (event) => {
  const userId = (event.context as any).auth?.userId || null

  const conferences = await prisma.conference.findMany({
    where: { status: { in: ['PENDING', 'LIVE'] } },
    orderBy: { scheduledAt: 'asc' },
    include: {
      author: { select: { firstName: true, lastName: true } },
      _count: { select: { registrations: true } },
      registrations: userId ? {
        where: { userId },
        select: { id: true },
      } : false,
    },
  })

  return conferences.map((c) => ({
    ...c,
    isRegistered: userId ? (c.registrations?.length ?? 0) > 0 : false,
    registrations: undefined,
  }))
})
