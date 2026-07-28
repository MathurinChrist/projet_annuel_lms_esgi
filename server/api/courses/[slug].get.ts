function parseDurationMinutes(value: string | null | undefined): number {
  if (!value) return 0
  const match = value.match(/(\d+)\s*min/)
  return match ? parseInt(match[1]) : 0
}

export default defineEventHandler(async (event) => {
  const userId = (event.context as any).auth?.userId || null
  const slug = getRouterParam(event, 'slug')!

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, title: true, type: true, duration: true, order: true },
          },
          _count: { select: { lessons: true } },
        },
      },
      reviews: {
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      },
      _count: { select: { enrollments: true } },
    },
  })

  if (!course || !course.published || !course.isPublic) {
    throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
  }

  const enrollment = userId ? await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  }) : null

  const reviewAgg = await prisma.courseReview.aggregate({
    where: { courseId: course.id },
    _avg: { rating: true },
    _count: true,
  })

  const allLessons = course.modules.flatMap(m => m.lessons)
  const durationMinutes = allLessons.reduce((sum, l) => sum + parseDurationMinutes(l.duration), 0)

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    coverImage: course.coverImage,
    difficulty: course.difficulty,
    tags: course.tags,
    hasCertificate: course.hasCertificate,
    category: course.category,
    author: course.author,
    modules: course.modules.map(m => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessonCount: m._count.lessons,
      durationMinutes: m.lessons.reduce((sum, l) => sum + parseDurationMinutes(l.duration), 0),
      lessons: m.lessons,
    })),
    recentReviews: course.reviews,
    rating: reviewAgg._avg.rating ?? 0,
    reviewCount: reviewAgg._count,
    enrollmentCount: course._count.enrollments,
    lessonCount: allLessons.length,
    durationMinutes,
    enrolled: !!enrollment,
    progress: enrollment?.progress ?? 0,
    createdAt: course.createdAt,
  }
})
