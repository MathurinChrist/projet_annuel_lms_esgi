
export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const id = parseInt(getRouterParam(event, 'id')!)

  const existing = await prisma.conference.findUnique({ where: { id } })
  if (!existing || existing.authorId !== auth.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  return prisma.conference.update({
    where: { id },
    data: { status: 'LIVE' },
  })
})
