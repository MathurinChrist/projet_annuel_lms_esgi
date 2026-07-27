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

  const id = parseInt(event.context.params?.id || '0')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID invalide'
    })
  }

  const body = await readBody(event)
  const { name } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le nom de la catégorie est requis'
    })
  }

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Catégorie introuvable'
    })
  }

  let slug = generateSlug(name)

  // Check slug uniqueness (exclude current category)
  let counter = 1
  let uniqueSlug = slug
  while (true) {
    const found = await prisma.category.findUnique({ where: { slug: uniqueSlug } })
    if (!found || found.id === id) break
    counter++
    uniqueSlug = `${slug}-${counter}`
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: name.trim(),
      slug: uniqueSlug
    },
    include: {
      _count: { select: { courses: true, subCategoryCourses: true } }
    }
  })

  return { category }
})
