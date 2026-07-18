export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

  const { userId } = (event.context as any).auth

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: 'desc' },
    include: {
      course: {
        include: {
          category: true,
          modules: { include: { _count: { select: { lessons: true } } } },
        },
      },
    },
  })

  return enrollments.map(e => ({
    progress: e.progress,
    enrolledAt: e.enrolledAt,
    course: {
      id: e.course.id,
      title: e.course.title,
      slug: e.course.slug,
      coverImage: e.course.coverImage,
      category: e.course.category,
      lessonCount: e.course.modules.reduce((sum, m) => sum + m._count.lessons, 0),
    },
  }))
})
