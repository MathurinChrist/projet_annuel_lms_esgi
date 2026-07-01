const MOCK_USER_ID = 1

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Le titre est requis' })
  }

  const slug = await generateUniqueSlug(body.title.trim())

  return prisma.course.create({
    data: {
      title: body.title.trim(),
      slug,
      description: body.description || null,
      categoryId: body.categoryId || null,
      subCategoryId: body.subCategoryId || null,
      difficulty: (body.difficulty || 'BEGINNER').toUpperCase(),
      tags: body.tags || [],
      coverImage: body.coverImage || null,
      authorId: MOCK_USER_ID,
      status: 'DRAFT',
    },
  })
})
