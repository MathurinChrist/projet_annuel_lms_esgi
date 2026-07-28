export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const id = Number(getRouterParam(event, 'id'))

  const note = await prisma.note.findUnique({ where: { id } })
  if (!note) throw createError({ statusCode: 404, statusMessage: 'Note introuvable' })
  if (note.userId !== userId) throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez supprimer que vos propres notes' })

  await prisma.note.delete({ where: { id } })

  return { deleted: true }
})
