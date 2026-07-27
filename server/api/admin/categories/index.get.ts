export default defineEventHandler(async (event) => {
  ensureAdmin(event)

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          _count: { select: { courses: true, subCategoryCourses: true } }
        },
        orderBy: { order: 'asc' }
      },
      _count: { select: { courses: true } }
    },
    orderBy: { order: 'asc' }
  })

  return { categories }
})
