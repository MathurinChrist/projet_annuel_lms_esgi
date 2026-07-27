export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const userId = auth.userId
  const q = String(getQuery(event).q ?? '').trim()

  if (q.length < 2) return []

  return prisma.user.findMany({
    where: {
      id: { not: userId },
      active: true,
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
    take: 10,
  })
})
