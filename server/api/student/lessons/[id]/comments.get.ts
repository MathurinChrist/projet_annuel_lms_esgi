export default defineEventHandler(async (event) => {
  const lessonId = Number(getRouterParam(event, 'id'))

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } })
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })

  const userSelect = { id: true, firstName: true, lastName: true, avatar: true, role: true } as const

  return prisma.lessonComment.findMany({
    where: { lessonId, parentId: null },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: userSelect },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: userSelect } },
      },
    },
  })
})
