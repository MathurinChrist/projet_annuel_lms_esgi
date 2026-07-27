import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/** A4 landscape in mm */
const PDF_W = 297
const PDF_H = 210

export async function downloadCertificatePdf(options: {
  element: HTMLElement
  fileName: string
  onProgress?: (label: string) => void
}) {
  const { element, fileName, onProgress } = options

  onProgress?.('Préparation du document…')

  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  onProgress?.('Rendu haute qualité…')

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#fbf8f1',
    logging: false,
    imageTimeout: 15000,
  })

  onProgress?.('Création du PDF…')

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  pdf.addImage(imgData, 'JPEG', 0, 0, PDF_W, PDF_H, undefined, 'FAST')
  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`)

  onProgress?.('')
}

export function useCertificatePdf() {
  const exporting = ref(false)
  const exportLabel = ref('')

  async function exportPdf(element: HTMLElement | null | undefined, fileName: string) {
    if (!element || exporting.value) return
    exporting.value = true
    exportLabel.value = 'Préparation…'
    try {
      await downloadCertificatePdf({
        element,
        fileName,
        onProgress: (label) => { exportLabel.value = label },
      })
    } finally {
      exporting.value = false
      exportLabel.value = ''
    }
  }

  return { exporting, exportLabel, exportPdf }
}
