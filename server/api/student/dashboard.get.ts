function parseDurationMinutes(value: string | null | undefined): number {
  if (!value) return 0
  const match = value.match(/(\d+)\s*min/)
  return match ? parseInt(match[1]) : 0
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

  const { userId } = (event.context as any).auth
  const days = getQuery(event).days === '30' ? 30 : 7

  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - 6)
  const startOfRange = new Date(startOfToday)
  startOfRange.setDate(startOfRange.getDate() - (days - 1))

  const [enrollments, lessonProgress] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      select: { progress: true, enrolledAt: true },
    }),
    prisma.lessonProgress.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      include: {
        lesson: {
          select: {
            title: true,
            duration: true,
            module: { select: { course: { select: { title: true, slug: true } } } },
          },
        },
      },
    }),
  ])

  const enrolledCourses = enrollments.length
  const enrolledThisWeek = enrollments.filter(e => e.enrolledAt >= startOfWeek).length

  const lessonsCompleted = lessonProgress.length
  const lessonsCompletedToday = lessonProgress.filter(lp => lp.completedAt >= startOfToday).length
  const learningMinutes = lessonProgress.reduce((sum, lp) => sum + parseDurationMinutes(lp.lesson.duration), 0)

  const goalPercent = enrolledCourses
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrolledCourses)
    : 0

  const activity = [...Array(days)].map((_, i) => {
    const day = new Date(startOfRange)
    day.setDate(startOfRange.getDate() + i)
    const next = new Date(day)
    next.setDate(day.getDate() + 1)
    const dayEntries = lessonProgress.filter(lp => lp.completedAt >= day && lp.completedAt < next)
    return {
      dayIndex: day.getDay(),
      dayOfMonth: day.getDate(),
      minutes: dayEntries.reduce((sum, lp) => sum + parseDurationMinutes(lp.lesson.duration), 0),
      lessonsCompleted: dayEntries.length,
    }
  })

  const recentActivity = lessonProgress.slice(0, 5).map(lp => ({
    lessonTitle: lp.lesson.title,
    courseTitle: lp.lesson.module.course.title,
    completedAt: lp.completedAt,
  }))

  return {
    stats: {
      enrolledCourses,
      enrolledThisWeek,
      lessonsCompleted,
      lessonsCompletedToday,
      learningMinutes,
    },
    goalPercent,
    activity,
    recentActivity,
  }
})
