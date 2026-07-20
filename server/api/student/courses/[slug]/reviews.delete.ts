export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const slug = getRouterParam(event, 'slug')!

  const course = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })

  await prisma.courseReview.deleteMany({ where: { userId, courseId: course.id } })

  const aggregate = await prisma.courseReview.aggregate({
    where: { courseId: course.id },
    _avg: { rating: true },
    _count: true,
  })

  return { deleted: true, average: aggregate._avg.rating ?? 0, count: aggregate._count }
})
