import { RoomServiceClient } from 'livekit-server-sdk'

export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const id = parseInt(getRouterParam(event, 'id')!)
  const config = useRuntimeConfig()

  const existing = await prisma.conference.findUnique({ where: { id } })
  if (!existing || existing.authorId !== auth.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé' })
  }

  // Supprime la room sur LiveKit pour stopper la session et éviter la consommation
  try {
    const svc = new RoomServiceClient(config.livekitHost, config.livekitApiKey, config.livekitApiSecret)
    await svc.deleteRoom(existing.roomName)
  } catch {}

  return prisma.conference.update({
    where: { id },
    data: { status: 'ENDED' },
  })
})
