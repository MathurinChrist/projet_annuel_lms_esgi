export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const slug = getRouterParam(event, 'slug')!
  const body = await readBody<{ rating: number; comment?: string }>(event)

  const rating = Number(body?.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, statusMessage: 'La note doit être un entier entre 1 et 5' })
  }
  const comment = body?.comment?.trim() || null

  const course = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  })
  if (!enrollment) {
    throw createError({ statusCode: 403, statusMessage: 'Vous devez être inscrit à ce cours pour laisser un avis' })
  }

  const review = await prisma.courseReview.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    update: { rating, comment },
    create: { userId, courseId: course.id, rating, comment },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  })

  const aggregate = await prisma.courseReview.aggregate({
    where: { courseId: course.id },
    _avg: { rating: true },
    _count: true,
  })

  return { review, average: aggregate._avg.rating ?? 0, count: aggregate._count }
})
