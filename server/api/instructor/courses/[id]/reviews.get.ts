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

  const [reviews, aggregate] = await Promise.all([
    prisma.courseReview.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    }),
    prisma.courseReview.aggregate({
      where: { courseId: course.id },
      _avg: { rating: true },
      _count: true,
    }),
  ])

  return {
    average: aggregate._avg.rating ?? 0,
    count: aggregate._count,
    reviews,
  }
})
