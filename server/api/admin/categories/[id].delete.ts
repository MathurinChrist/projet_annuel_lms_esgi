export default defineEventHandler(async (event) => {
  ensureAdmin(event)

  const id = parseInt(event.context.params?.id || '0')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID invalide'
    })
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          courses: true,
          subCategoryCourses: true,
          children: true
        }
      }
    }
  })

  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Catégorie introuvable'
    })
  }

  const totalCourses = category._count.courses + category._count.subCategoryCourses
  if (totalCourses > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Impossible de supprimer cette catégorie : ${totalCourses} cours y sont associés`
    })
  }

  if (category._count.children > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Impossible de supprimer cette catégorie : elle contient ${category._count.children} sous-catégories`
    })
  }

  await prisma.category.delete({ where: { id } })

  return { success: true }
})
