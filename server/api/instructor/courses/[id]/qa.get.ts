export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const param = getRouterParam(event, 'id')!
  const isNumeric = /^\d+$/.test(param)

  const course = await prisma.course.findUnique({
    where: isNumeric ? { id: Number(param) } : { slug: param },
    select: { id: true, authorId: true },
  })
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
  if (course.authorId !== userId) throw createError({ statusCode: 403, statusMessage: 'Accès réservé à l\'auteur du cours' })

  const userSelect = { id: true, firstName: true, lastName: true, avatar: true, role: true } as const

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      title: true,
      lessons: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          comments: {
            where: { parentId: null },
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: userSelect },
              replies: {
                orderBy: { createdAt: 'asc' },
                include: { user: { select: userSelect } },
              },
            },
          },
        },
      },
    },
  })

  const lessons = modules
    .flatMap(m => m.lessons.map(l => ({ id: l.id, title: l.title, moduleTitle: m.title, comments: l.comments })))
    .filter(l => l.comments.length > 0)

  const questionCount = lessons.reduce((sum, l) => sum + l.comments.length, 0)

  return { lessons, questionCount }
})
