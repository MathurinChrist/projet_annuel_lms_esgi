import { buildCertificatePdfBuffer } from '../../../../utils/certificatePdf'
import { sumCourseDurationMinutes, formatDurationLabel } from '../../../../utils/certificate'

export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const code = decodeURIComponent(getRouterParam(event, 'code') || '')

  const cert = await prisma.certificate.findFirst({
    where: { code, userId },
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
    throw createError({ statusCode: 404, message: 'Certificat introuvable.' })
  }

  try {
    const fullName = [cert.user.firstName, cert.user.lastName].filter(Boolean).join(' ') || cert.user.email
    const authorName = [cert.course.author.firstName, cert.course.author.lastName].filter(Boolean).join(' ') || 'Formateur'
    const durationMinutes = sumCourseDurationMinutes(cert.course.modules)
    const durationLabel = formatDurationLabel(durationMinutes)

    const pdf = await buildCertificatePdfBuffer({
      code: cert.code,
      levelLabel: cert.levelLabel,
      mention: cert.mention,
      scorePercent: cert.scorePercent,
      issuedAt: cert.issuedAt,
      durationLabel,
      learner: { fullName, email: cert.user.email },
      course: {
        title: cert.course.title,
        category: cert.course.category?.name || null,
        author: { fullName: authorName },
      },
    })

    const safe = `Certificat-${cert.code}.pdf`.replace(/[^\w.-]+/g, '_')
    setResponseHeader(event, 'Content-Type', 'application/pdf')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${safe}"`)
    setResponseHeader(event, 'Cache-Control', 'no-store')
    setResponseHeader(event, 'Content-Length', String(pdf.length))

    return send(event, pdf)
  } catch (err: any) {
    console.error('[certificate-pdf]', err)
    throw createError({
      statusCode: 500,
      message: err?.message || 'Impossible de générer le PDF du certificat.',
    })
  }
})
