import { RoomServiceClient } from 'livekit-server-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const auth = (event.context as any).auth
  const { roomName, identity, grant } = await readBody(event)

  const conference = await prisma.conference.findUnique({ where: { roomName } })
  if (!conference) {
    throw createError({ statusCode: 404, statusMessage: 'Conférence introuvable' })
  }

  if (conference.authorId !== auth.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Seul le créateur peut gérer la parole' })
  }

  const svc = new RoomServiceClient(
    config.livekitHost,
    config.livekitApiKey,
    config.livekitApiSecret,
  )

  await svc.updateParticipant(roomName, identity, undefined, {
    canPublish: grant,
    canSubscribe: true,
    canPublishData: true,
  })

  return { ok: true }
})
