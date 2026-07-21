import { AccessToken } from 'livekit-server-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const auth = (event.context as any).auth
  const { roomName } = await readBody(event)

  if (!roomName) {
    throw createError({ statusCode: 400, statusMessage: 'roomName requis' })
  }

  const [conference, user] = await Promise.all([
    prisma.conference.findUnique({ where: { roomName } }),
    prisma.user.findUnique({ where: { id: auth.userId } }),
  ])

  if (!conference) {
    throw createError({ statusCode: 404, statusMessage: 'Conférence introuvable' })
  }

  const isHost = conference.authorId === auth.userId
  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : auth.email

  const at = new AccessToken(config.livekitApiKey, config.livekitApiSecret, {
    identity: String(auth.userId),
    name: displayName,
  })

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: isHost,
    canSubscribe: true,
    canPublishData: true,
  })

  return {
    token: await at.toJwt(),
    isHost,
    conference: {
      id: conference.id,
      title: conference.title,
      status: conference.status,
    },
  }
})
