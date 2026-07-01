export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  return prisma.course.update({
    where: { id },
    data: {
      published: true,
      status: 'PUBLISHED',
      isPublic: body.isPublic ?? true,
      hasCertificate: body.hasCertificate ?? true,
    },
  })
})
