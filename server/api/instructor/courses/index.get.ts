const MOCK_USER_ID = 1

export default defineEventHandler(async () => {
  return prisma.course.findMany({
    where: { authorId: MOCK_USER_ID },
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
