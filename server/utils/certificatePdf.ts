import { CERTIFICATE_PLATFORM } from './certificate'

export type CertificatePdfData = {
  code: string
  levelLabel: string
  mention?: string | null
  scorePercent?: number | null
  issuedAt: string | Date
  durationLabel?: string | null
  learner: { fullName: string; email: string }
  course: {
    title: string
    category?: string | null
    author: { fullName: string }
  }
}

function formatDateEn(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/**
 * LinkedIn Learning–inspired landscape certificate (A4).
 */
export async function buildCertificatePdfBuffer(data: CertificatePdfData): Promise<Buffer> {
  const BLUE = '#0A66C2'
  const INK = '#191919'
  const MUTED = '#666666'
  const SAND = '#F4F2EE'
  const WHITE = '#FFFFFF'
  const ACCENT = '#057642'
  const LINE = '#D9D3C9'

  const W = 841.89
  const H = 595.28
  const splitX = W * 0.64
  const durationLabel = data.durationLabel || '—'

  const { default: PDFDocument } = await import('pdfkit')

  return await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
      info: {
        Title: `Certificate — ${data.course.title}`,
        Author: CERTIFICATE_PLATFORM.name,
        Subject: 'Certificate of Completion',
      },
    })

    const chunks: Buffer[] = []
    doc.on('data', (c) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.rect(0, 0, W, H).fill(WHITE)

    doc.rect(splitX, 0, W - splitX, H).fill(SAND)
    doc.moveTo(splitX, 0).lineTo(splitX, H).strokeColor(LINE).lineWidth(1).stroke()

    doc.rect(0, 0, W, 5).fill(BLUE)
    doc.rect(0, H - 5, W, 5).fill(BLUE)

    const lx = 52
    const leftMax = splitX - 64

    doc.roundedRect(lx, 34, 26, 26, 6).fill(BLUE)
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(11).text('EP', lx, 42, { width: 26, align: 'center' })

    doc.fillColor(INK).font('Helvetica-Bold').fontSize(12).text('EduPulse LMS', lx + 34, 38)
    doc.fillColor(MUTED).font('Helvetica').fontSize(9).text('Certificate of Completion', lx + 34, 54)

    doc.fillColor(MUTED)
      .font('Helvetica')
      .fontSize(12)
      .text(`Congratulations, ${data.learner.fullName || 'Learner'}`, lx, 100)

    doc.fillColor(INK)
      .font('Helvetica-Bold')
      .fontSize(24)
      .text(data.course.title, lx, 130, {
        width: leftMax,
        height: 78,
        ellipsis: true,
      })

    const completedLine = data.course.category
      ? `has successfully completed this online course in ${data.course.category} on ${formatDateEn(data.issuedAt)}.`
      : `has successfully completed this online course on ${formatDateEn(data.issuedAt)}.`

    doc.fillColor(MUTED)
      .font('Helvetica')
      .fontSize(11)
      .text(completedLine, lx, 220, { width: leftMax, lineGap: 2 })

    let chipX = lx
    const chipY = 268
    const chips: Array<{ label: string; bg: string; fg: string }> = [
      { label: data.levelLabel, bg: '#E8F3FF', fg: BLUE },
      ...(data.mention ? [{ label: data.mention, bg: '#E8F3EC', fg: ACCENT }] : []),
      ...(data.scorePercent != null
        ? [{ label: `Score ${data.scorePercent}%`, bg: WHITE, fg: MUTED }]
        : []),
      { label: `Durée ${durationLabel}`, bg: WHITE, fg: MUTED },
    ]

    doc.font('Helvetica-Bold').fontSize(8)
    for (const chip of chips) {
      const tw = doc.widthOfString(chip.label) + 16
      if (chipX + tw > lx + leftMax) break
      doc.roundedRect(chipX, chipY, tw, 18, 9).fill(chip.bg)
      if (chip.bg === WHITE) {
        doc.roundedRect(chipX, chipY, tw, 18, 9).strokeColor(LINE).lineWidth(0.8).stroke()
      }
      doc.fillColor(chip.fg).text(chip.label, chipX, chipY + 5, { width: tw, align: 'center' })
      chipX += tw + 8
    }

    const boxY = 420
    doc.roundedRect(lx, boxY, 150, 70, 8).fill('#F8FBFE')
    doc.roundedRect(lx, boxY, 150, 70, 8).strokeColor('#BFD4EA').lineWidth(1).stroke()
    doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(7).text('TEMPS DE FORMATION', lx + 12, boxY + 12)
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(16).text(durationLabel, lx + 12, boxY + 28)
    doc.fillColor(MUTED).font('Helvetica').fontSize(8).text('Volume horaire du parcours', lx + 12, boxY + 50)

    const sx2 = lx + 180
    doc.fillColor(BLUE).font('Times-Italic').fontSize(16).text(data.course.author.fullName, sx2, boxY + 12)
    doc.moveTo(sx2, boxY + 36).lineTo(sx2 + 160, boxY + 36).strokeColor('#CFC9BE').lineWidth(0.8).stroke()
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(9).text('Formateur · Instructeur', sx2, boxY + 42)
    doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(CERTIFICATE_PLATFORM.name, sx2, boxY + 56)

    const rx = splitX + 32
    const rw = W - splitX - 60

    doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(18).text(CERTIFICATE_PLATFORM.name, rx, 40, { width: rw })
    doc.fillColor(MUTED).font('Helvetica').fontSize(9).text(CERTIFICATE_PLATFORM.tagline, rx, 66, { width: rw })
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(10).text(CERTIFICATE_PLATFORM.institution, rx, 100, { width: rw })
    doc.fillColor(MUTED).font('Helvetica').fontSize(9).text(`Année ${CERTIFICATE_PLATFORM.academicYear}`, rx, 128, { width: rw })

    doc.rect(rx, 168, rw, 84).fill(WHITE)
    doc.rect(rx, 168, rw, 84).strokeColor(BLUE).lineWidth(1.2).stroke()
    doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(8).text('CERTIFICATE LEVEL', rx, 178, { width: rw, align: 'center' })
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(14).text(data.levelLabel, rx, 196, { width: rw, align: 'center' })
    if (data.mention) {
      doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(9).text(data.mention, rx, 216, { width: rw, align: 'center' })
    }
    doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(`Durée : ${durationLabel}`, rx, 232, { width: rw, align: 'center' })

    const sealCx = rx + rw / 2
    const sealCy = 360
    const sealR = 58
    doc.circle(sealCx, sealCy, sealR).strokeColor(BLUE).lineWidth(2.5).stroke()
    doc.circle(sealCx, sealCy, sealR - 6).strokeColor(BLUE).lineWidth(0.8).stroke()
    doc.circle(sealCx, sealCy, sealR - 12).fill(BLUE)
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8).text('ESGI', sealCx - 40, sealCy - 28, { width: 80, align: 'center' })
    doc.fontSize(13).text('EduPulse', sealCx - 40, sealCy - 12, { width: 80, align: 'center' })
    doc.fontSize(7).text('CACHET OFFICIEL', sealCx - 42, sealCy + 8, { width: 84, align: 'center' })
    doc.fontSize(7).text(CERTIFICATE_PLATFORM.academicYear, sealCx - 40, sealCy + 20, { width: 80, align: 'center' })

    doc.moveTo(rx, H - 88).lineTo(rx + rw, H - 88).strokeColor(LINE).lineWidth(0.8).stroke()
    doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(8).text('CERTIFICATE ID', rx, H - 78, { width: rw })
    doc.fillColor(INK).font('Helvetica').fontSize(8).text(data.code, rx, H - 62, { width: rw })
    doc.fillColor(MUTED).font('Helvetica').fontSize(7)
      .text('Verify this credential in your EduPulse Certificates space.', rx, H - 42, { width: rw })

    doc.end()
  })
}
