export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const lessonId = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ content: string; parentId?: number }>(event)

  const content = body?.content?.trim()
  if (!content) throw createError({ statusCode: 400, statusMessage: 'Le message ne peut pas être vide' })

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { courseId: true } } },
  })
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })

  let parentId: number | null = null
  if (body?.parentId != null) {
    const parent = await prisma.lessonComment.findUnique({ where: { id: Number(body.parentId) } })
    if (!parent || parent.lessonId !== lessonId) {
      throw createError({ statusCode: 400, statusMessage: 'Message parent introuvable' })
    }
    parentId = parent.id
  }

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
    update: {},
    create: { userId, courseId: lesson.module.courseId },
  })

  const userSelect = { id: true, firstName: true, lastName: true, avatar: true, role: true } as const

  return prisma.lessonComment.create({
    data: { userId, lessonId, parentId, content },
    include: { user: { select: userSelect }, replies: true },
  })
})
