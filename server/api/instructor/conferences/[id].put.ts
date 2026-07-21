
export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const id = parseInt(getRouterParam(event, 'id')!)
  const body = await readBody(event)

  const existing = await prisma.conference.findUnique({ where: { id } })
  if (!existing || existing.authorId !== auth.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  return prisma.conference.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description || null,
      scheduledAt: new Date(body.scheduledAt),
    },
  })
})
