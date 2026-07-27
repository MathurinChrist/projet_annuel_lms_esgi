import PDFDocument from 'pdfkit'

const W = 841.89
const H = 595.28

const WHITE   = '#ffffff'
const IVORY   = '#fdfcf8' // léger panneau intérieur, presque blanc
const NAVY    = '#0f172a'
const GOLD    = '#b8912f'
const GOLD_L  = '#d4a843'
const SLATE   = '#64748b'
const SLATE2  = '#94a3b8'

function drawCornerOrnament(doc: InstanceType<typeof PDFDocument>, x: number, y: number, dirX: number, dirY: number) {
  const len = 35
  doc.moveTo(x, y).lineTo(x + dirX * len, y).lineWidth(1.5).strokeColor(GOLD).stroke()
  doc.moveTo(x, y).lineTo(x, y + dirY * len).lineWidth(1.5).strokeColor(GOLD).stroke()
  doc.circle(x, y, 3).fillColor(GOLD).fill()
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const studentName = String(query.name  || 'Jean Dupont')
  const courseName  = String(query.course || 'Introduction au Développement Web')
  const instructor  = String(query.instructor || 'Marie Martin')
  const date        = String(query.date  || new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // ── Background ──────────────────────────────────────────────
    doc.rect(0, 0, W, H).fill(WHITE)

    // Léger panneau intérieur pour donner un peu de profondeur sans assombrir
    doc.rect(26, 26, W - 52, H - 52).fill(IVORY)

    // ── Borders ─────────────────────────────────────────────────
    doc.rect(18, 18, W - 36, H - 36).lineWidth(2).strokeColor(GOLD).stroke()
    doc.rect(26, 26, W - 52, H - 52).lineWidth(0.4).strokeColor(GOLD).stroke()

    // ── Corner ornaments ────────────────────────────────────────
    drawCornerOrnament(doc, 26,      26,      1,  1)
    drawCornerOrnament(doc, W - 26,  26,     -1,  1)
    drawCornerOrnament(doc, 26,      H - 26,  1, -1)
    drawCornerOrnament(doc, W - 26,  H - 26, -1, -1)

    // ── Header: platform name ────────────────────────────────────
    doc
        .fontSize(11)
        .fillColor(GOLD)
        .font('Helvetica')
        .text('E D U P U L S E', 0, 52, { align: 'center', width: W })

    // ── Decorative top line ──────────────────────────────────────
    const lineY = 78
    doc.moveTo(120, lineY).lineTo(W - 120, lineY).lineWidth(0.5).strokeColor(SLATE2).stroke()
    doc.moveTo(120, lineY + 3).lineTo(W - 120, lineY + 3).lineWidth(0.3).strokeColor(SLATE2).stroke()

    // ── Main title ───────────────────────────────────────────────
    doc
        .fontSize(34)
        .fillColor(NAVY)
        .font('Helvetica-Bold')
        .text('CERTIFICAT DE RÉUSSITE', 0, 95, { align: 'center', width: W, characterSpacing: 3 })

    // ── Gold divider ─────────────────────────────────────────────
    const div1Y = 145
    doc.moveTo(200, div1Y).lineTo(W - 200, div1Y).lineWidth(1).strokeColor(GOLD).stroke()
    doc.circle(W / 2, div1Y, 3).fillColor(GOLD).fill()

    // ── "Décerné à" ──────────────────────────────────────────────
    doc
        .fontSize(12)
        .fillColor(SLATE)
        .font('Helvetica-Oblique')
        .text('Décerné à', 0, 162, { align: 'center', width: W })

    // ── Student name ─────────────────────────────────────────────
    const nameFontSize = studentName.length > 24 ? 36 : 44
    doc
        .fontSize(nameFontSize)
        .fillColor(NAVY)
        .font('Helvetica-Bold')
        .text(studentName, 0, 185, { align: 'center', width: W })

    // ── Underline below name ─────────────────────────────────────
    const nameEndY = 185 + nameFontSize + 10
    doc.moveTo(260, nameEndY).lineTo(W - 260, nameEndY).lineWidth(0.5).strokeColor(SLATE2).stroke()

    // ── "Pour avoir complété..." ─────────────────────────────────
    doc
        .fontSize(12)
        .fillColor(SLATE)
        .font('Helvetica')
        .text('Pour avoir complété avec succès la formation', 0, nameEndY + 16, { align: 'center', width: W })

    // ── Course name ──────────────────────────────────────────────
    const courseY = nameEndY + 40
    const courseFontSize = courseName.length > 40 ? 18 : 22
    doc
        .fontSize(courseFontSize)
        .fillColor(GOLD)
        .font('Helvetica-Bold')
        .text(courseName, 60, courseY, { align: 'center', width: W - 120 })

    // ── Date ─────────────────────────────────────────────────────
    const dateY = courseY + courseFontSize + 28
    doc
        .fontSize(11)
        .fillColor(SLATE)
        .font('Helvetica')
        .text(`Délivré le ${date}`, 0, dateY, { align: 'center', width: W })

    // ── Signature area ───────────────────────────────────────────
    const sigY = H - 120
    const sigLen = 160

    // Left signature (instructor)
    const lSigX = 160
    doc.moveTo(lSigX, sigY).lineTo(lSigX + sigLen, sigY).lineWidth(0.5).strokeColor(SLATE2).stroke()
    doc.fontSize(9).fillColor(NAVY).font('Helvetica').text(instructor, lSigX, sigY + 6, { width: sigLen, align: 'center' })
    doc.fontSize(8).fillColor(SLATE).text('Formateur', lSigX, sigY + 18, { width: sigLen, align: 'center' })

    // Right signature (director)
    const rSigX = W - 160 - sigLen
    doc.moveTo(rSigX, sigY).lineTo(rSigX + sigLen, sigY).lineWidth(0.5).strokeColor(SLATE2).stroke()
    doc.fontSize(9).fillColor(NAVY).font('Helvetica').text('Directeur Pédagogique', rSigX, sigY + 6, { width: sigLen, align: 'center' })
    doc.fontSize(8).fillColor(SLATE).text('EduPulse', rSigX, sigY + 18, { width: sigLen, align: 'center' })

    // Center stamp circle
    const stampX = W / 2
    const stampY = sigY + 5
    doc.circle(stampX, stampY, 28).lineWidth(1).strokeColor(GOLD).stroke()
    doc.circle(stampX, stampY, 23).lineWidth(0.3).strokeColor(GOLD).stroke()
    doc.fontSize(6).fillColor(GOLD).text('OFFICIEL', stampX - 14, stampY - 4)
    doc.fontSize(5).fillColor(SLATE).text('EDUPULSE', stampX - 13, stampY + 4)

    // ── Footer ───────────────────────────────────────────────────
    const footY = H - 44
    doc.moveTo(120, footY).lineTo(W - 120, footY).lineWidth(0.3).strokeColor(SLATE2).stroke()

    const certId = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    doc
        .fontSize(7.5)
        .fillColor(SLATE)
        .font('Helvetica')
        .text(`Certificat N° ${certId}  |  edupulse.fr  |  Ce certificat atteste de la complétion de la formation`, 0, footY + 6, { align: 'center', width: W })

    doc.end()
  })

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `attachment; filename="certificat-${studentName.replace(/\s+/g, '-').toLowerCase()}.pdf"`)
  setHeader(event, 'Content-Length', String(buffer.length))

  return buffer
})