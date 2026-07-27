import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'

const ALLOWED_TYPES: Record<string, string[]> = {
  'image/jpeg': ['jpg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'application/pdf': ['pdf'],
}

const MAX_SIZE_MB = 20

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, message: 'Aucun fichier reçu.' })
  }

  const file = parts[0]

  const mime = file.type ?? ''
  const exts = ALLOWED_TYPES[mime]
  if (!exts) {
    throw createError({ statusCode: 400, message: 'Type de fichier non autorisé.' })
  }

  const sizeInMB = (file.data.byteLength / 1024 / 1024)
  if (sizeInMB > MAX_SIZE_MB) {
    throw createError({ statusCode: 400, message: `Fichier trop lourd (max ${MAX_SIZE_MB} Mo).` })
  }

  const ext = extname(file.filename ?? '') || `.${exts[0]}`
  const filename = `${randomUUID()}${ext}`
  const uploadsDir = join(process.cwd(), 'public', 'uploads')

  await mkdir(uploadsDir, { recursive: true })
  await writeFile(join(uploadsDir, filename), file.data)

  return { url: `/uploads/${filename}` }
})
