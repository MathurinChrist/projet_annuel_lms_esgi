import { prisma } from './prisma'

function toSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function generateUniqueSlug(title: string): Promise<string> {
  const base = toSlug(title) || 'cours'
  let slug = base
  let i = 2
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`
  }
  return slug
}
