export default defineEventHandler(async () => {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    include: {
      children: { orderBy: { order: 'asc' } },
    },
  })
})
