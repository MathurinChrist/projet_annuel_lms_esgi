export default defineEventHandler(async (event) => {
  const courseId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (body.title !== undefined && !body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Le titre ne peut pas être vide' })
  }

  return prisma.course.update({
    where: { id: courseId },
    data: {
      title: body.title?.trim(),
      description: body.description ?? undefined,
      categoryId: body.categoryId ?? undefined,
      subCategoryId: body.subCategoryId ?? undefined,
      difficulty: body.difficulty ? body.difficulty.toUpperCase() : undefined,
      tags: body.tags ?? undefined,
      coverImage: body.coverImage ?? undefined,
      isPublic: body.isPublic ?? undefined,
      hasCertificate: body.hasCertificate ?? undefined,
    },
  })
})
