import {
  CERTIFICATE_PLATFORM,
  resolveCertificateLevel,
  generateCertificateCode,
  sumCourseDurationMinutes,
  formatDurationLabel,
} from '../../../../utils/certificate'

function certificatePayload(cert: any) {
  const durationMinutes = sumCourseDurationMinutes(cert.course?.modules)
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
}

const certificateInclude = {
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
} as const

export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const slug = getRouterParam(event, 'slug')!

  let body: any = {}
  try {
    body = await readBody(event)
  } catch {
    body = {}
  }
  const scorePercent = body?.scorePercent != null && !Number.isNaN(Number(body.scorePercent))
    ? Number(body.scorePercent)
    : null

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { firstName: true, lastName: true } },
    },
  })

  if (!course) {
    throw createError({ statusCode: 404, message: 'Cours introuvable' })
  }

  if (!course.hasCertificate) {
    throw createError({
      statusCode: 403,
      message: 'Ce cours ne délivre pas de certificat.',
    })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  })

  if (!enrollment || enrollment.progress < 100) {
    throw createError({
      statusCode: 403,
      message: 'Vous devez valider l’examen final (100 % de progression) pour obtenir le certificat.',
    })
  }

  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    include: certificateInclude,
  })

  if (existing) {
    if (scorePercent != null && (existing.scorePercent == null || scorePercent > existing.scorePercent)) {
      const resolved = resolveCertificateLevel(course.difficulty, scorePercent)
      const updated = await prisma.certificate.update({
        where: { id: existing.id },
        data: {
          scorePercent,
          level: resolved.level,
          levelLabel: resolved.label,
          mention: resolved.mention,
        },
        include: certificateInclude,
      })
      return certificatePayload(updated)
    }
    return certificatePayload(existing)
  }

  const resolved = resolveCertificateLevel(course.difficulty, scorePercent)
  const code = generateCertificateCode(course.id, userId)

  const created = await prisma.certificate.create({
    data: {
      code,
      userId,
      courseId: course.id,
      level: resolved.level,
      levelLabel: resolved.label,
      mention: resolved.mention,
      scorePercent,
    },
    include: certificateInclude,
  })

  return certificatePayload(created)
})
