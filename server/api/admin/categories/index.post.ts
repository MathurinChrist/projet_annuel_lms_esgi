function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default defineEventHandler(async (event) => {
  ensureAdmin(event)

  const body = await readBody(event)
  const { name, parentId } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le nom de la catégorie est requis'
    })
  }

  let slug = generateSlug(name)

  // Check slug uniqueness
  let counter = 1
  let uniqueSlug = slug
  while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
    counter++
    uniqueSlug = `${slug}-${counter}`
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug: uniqueSlug,
      parentId: parentId || null
    },
    include: {
      _count: { select: { courses: true, subCategoryCourses: true } }
    }
  })

  return { category }
})
