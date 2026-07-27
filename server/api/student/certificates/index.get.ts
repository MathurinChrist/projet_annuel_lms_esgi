import { sumCourseDurationMinutes, formatDurationLabel } from '../../../utils/certificate'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

  const { userId } = (event.context as any).auth

  const certificates = await prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          difficulty: true,
          category: { select: { name: true } },
          modules: {
            select: {
              lessons: { select: { duration: true } },
            },
          },
        },
      },
    },
  })

  const completed = await prisma.enrollment.findMany({
    where: {
      userId,
      progress: 100,
      course: { hasCertificate: true },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          difficulty: true,
          category: { select: { name: true } },
        },
      },
    },
  })

  const issuedCourseIds = new Set(certificates.map(c => c.courseId))

  return {
    certificates: certificates.map((c) => {
      const durationMinutes = sumCourseDurationMinutes(c.course.modules)
      const durationLabel = formatDurationLabel(durationMinutes)
      const { modules, category, ...courseRest } = c.course
      return {
        id: c.id,
        code: c.code,
        level: c.level,
        levelLabel: c.levelLabel,
        mention: c.mention,
        scorePercent: c.scorePercent,
        issuedAt: c.issuedAt,
        durationMinutes,
        durationLabel,
        course: {
          ...courseRest,
          category: category?.name || null,
          durationMinutes,
          durationLabel,
        },
      }
    }),
    pending: completed
      .filter(e => !issuedCourseIds.has(e.courseId))
      .map(e => ({
        course: {
          ...e.course,
          category: e.course.category?.name || null,
        },
      })),
  }
})
