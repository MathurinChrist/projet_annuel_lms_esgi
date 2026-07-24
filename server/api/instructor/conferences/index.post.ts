
export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth
  const body = await readBody(event)

  if (!body.title || !body.scheduledAt) {
    throw createError({ statusCode: 400, statusMessage: 'Titre et date requis' })
  }

  const roomName = `room-${crypto.randomUUID().slice(0, 8)}`

  const conference = await prisma.conference.create({
    data: {
      title: body.title,
      description: body.description || null,
      scheduledAt: new Date(body.scheduledAt),
      roomName,
      authorId: auth.userId,
    },
  })

  return conference
})
