
export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const id = parseInt(getRouterParam(event, 'id')!)

  const conference = await prisma.conference.findUnique({ where: { id } })
  if (!conference) {
    throw createError({ statusCode: 404, statusMessage: 'Conférence introuvable' })
  }

  try {
    await prisma.conferenceRegistration.create({
      data: { userId: auth.userId, conferenceId: id },
    })
  } catch {
    // déjà inscrit
  }

  return { ok: true }
})
