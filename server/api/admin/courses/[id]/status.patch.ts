export default defineEventHandler(async (event) => {
  ensureAdmin(event)

  const courseId = Number(getRouterParam(event, 'id'))
  const { published } = await readBody(event)

  if (typeof published !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le champ published doit être un booléen',
    })
  }

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      published,
      status: published ? 'PUBLISHED' : 'DRAFT',
    },
    select: {
      id: true,
      title: true,
      published: true,
      status: true,
    },
  })

  return { course }
})
