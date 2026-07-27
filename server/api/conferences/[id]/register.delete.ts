
export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const id = parseInt(getRouterParam(event, 'id')!)

  await prisma.conferenceRegistration.deleteMany({
    where: { userId: auth.userId, conferenceId: id },
  })

  return { ok: true }
})
