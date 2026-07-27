import {
  CERTIFICATE_PLATFORM,
  sumCourseDurationMinutes,
  formatDurationLabel,
} from '../../../../utils/certificate'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

  const { userId } = (event.context as any).auth
  const slug = getRouterParam(event, 'slug')!

  const course = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
  if (!course) throw createError({ statusCode: 404, message: 'Cours introuvable' })

  const cert = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      course: {
        include: {
          category: true,
          author: { select: { firstName: true, lastName: true } },
          modules: {
            include: {
              lessons: { select: { duration: true } },
            },
          },
        },
      },
    },
  })

  if (!cert) {
    throw createError({ statusCode: 404, message: 'Aucun certificat émis pour ce cours.' })
  }

  const durationMinutes = sumCourseDurationMinutes(cert.course.modules)
  const durationLabel = formatDurationLabel(durationMinutes)

  return {
    id: cert.id,
    code: cert.code,
    level: cert.level,
    levelLabel: cert.levelLabel,
    mention: cert.mention,
    scorePercent: cert.scorePercent,
    issuedAt: cert.issuedAt,
    durationMinutes,
    durationLabel,
    learner: {
      firstName: cert.user.firstName,
      lastName: cert.user.lastName,
      email: cert.user.email,
      fullName: [cert.user.firstName, cert.user.lastName].filter(Boolean).join(' ') || cert.user.email,
    },
    course: {
      id: cert.course.id,
      title: cert.course.title,
      slug: cert.course.slug,
      difficulty: cert.course.difficulty,
      category: cert.course.category?.name || null,
      description: cert.course.description,
      durationMinutes,
      durationLabel,
      author: {
        firstName: cert.course.author.firstName,
        lastName: cert.course.author.lastName,
        fullName: [cert.course.author.firstName, cert.course.author.lastName].filter(Boolean).join(' ') || 'Formateur',
      },
    },
    platform: CERTIFICATE_PLATFORM,
  }
})
