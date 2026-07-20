export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const slug = getRouterParam(event, 'slug')!

  const course = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })

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
    myReview: reviews.find(r => r.userId === userId) ?? null,
  }
})
