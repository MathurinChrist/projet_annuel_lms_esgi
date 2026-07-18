export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  return prisma.course.findMany({
    where: { authorId: userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      category: true,
      subCategory: true,
      modules: {
        include: {
          _count: { select: { lessons: true } },
        },
      },
    },
  })
})
