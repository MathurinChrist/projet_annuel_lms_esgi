import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { loadEnvFile } from '../helpers/env'

loadEnvFile()

/**
 * Intégration Prisma ↔ logique métier certificat / utilisateurs.
 * Nécessite DATABASE_URL (docker-db-up ou stack complète).
 */
describe('prisma + certificate duration (integration)', () => {
  let prisma: any
  let pool: any

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL manquant — lancez la base (make docker-db-up)')
    }

    const pkg = await import('@prisma/client')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const pg = await import('pg')

    pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL })
    prisma = new pkg.PrismaClient({ adapter: new PrismaPg(pool) })
  })

  afterAll(async () => {
    await prisma?.$disconnect?.()
    await pool?.end?.()
  })

  it('lit un utilisateur seed depuis la base', async () => {
    const user = await prisma.user.findUnique({
      where: { email: 'marie.apprenant@edupulse.com' },
      select: { id: true, email: true, role: true, active: true },
    })
    expect(user).toBeTruthy()
    expect(user.email).toBe('marie.apprenant@edupulse.com')
    expect(user.active).toBe(true)
  })

  it('calcule la durée d’un cours réel à partir des leçons en base', async () => {
    const { sumCourseDurationMinutes, formatDurationLabel } = await import(
      '../../server/utils/certificate'
    )

    const course = await prisma.course.findFirst({
      where: { published: true },
      include: {
        modules: {
          include: {
            lessons: { select: { duration: true } },
          },
        },
      },
    })

    expect(course).toBeTruthy()
    const minutes = sumCourseDurationMinutes(course.modules)
    expect(minutes).toBeGreaterThanOrEqual(0)
    const label = formatDurationLabel(minutes)
    expect(typeof label).toBe('string')
    expect(label.length).toBeGreaterThan(0)
  })

  it('génère un slug unique qui n’entre pas en collision', async () => {
    const { generateUniqueSlug, toSlug } = await import('../../server/utils/slug')

    // Monkey-patch via real prisma used by slug util — it uses server/utils/prisma.
    // On teste plutôt toSlug + existence d’un cours connu.
    const existing = await prisma.course.findFirst({ select: { slug: true, title: true } })
    expect(existing?.slug).toBeTruthy()
    if (existing?.title) {
      expect(toSlug(existing.title).length).toBeGreaterThan(0)
    }

    const slug = await generateUniqueSlug(`Cours test vitest ${Date.now()}`)
    expect(slug).toMatch(/^cours-test-vitest-/)
    const collision = await prisma.course.findUnique({ where: { slug } })
    expect(collision).toBeNull()
  })
})
