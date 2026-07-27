import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { loadEnvFile } from '../helpers/env'

loadEnvFile()

describe('progress recalculate (integration)', () => {
  let prisma: any
  let pool: any

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquant')
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

  it('recalcule la progression d’une inscription existante', async () => {
    const { recalculateEnrollmentProgress } = await import('../../server/utils/progress')

    const enrollment = await prisma.enrollment.findFirst({
      include: { course: true, user: true },
    })
    expect(enrollment).toBeTruthy()

    const progress = await recalculateEnrollmentProgress(enrollment.userId, enrollment.courseId)
    expect(progress).toBeGreaterThanOrEqual(0)
    expect(progress).toBeLessThanOrEqual(100)

    const refreshed = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
        },
      },
    })
    expect(refreshed.progress).toBe(progress)
  })
})

describe('certificate PDF buffer (integration)', () => {
  it('génère un PDF valide (%PDF)', async () => {
    const { buildCertificatePdfBuffer } = await import('../../server/utils/certificatePdf')
    const buf = await buildCertificatePdfBuffer({
      code: 'EDU-TEST-UNIT-1',
      levelLabel: 'Niveau Initiation',
      mention: 'Mention Bien',
      scorePercent: 80,
      issuedAt: new Date(),
      durationLabel: '20 min',
      learner: { fullName: 'Test User', email: 'test@edupulse.com' },
      course: {
        title: 'Cours Test',
        category: 'Dev',
        author: { fullName: 'Formateur Test' },
      },
    })
    expect(Buffer.isBuffer(buf)).toBe(true)
    expect(buf.length).toBeGreaterThan(500)
    expect(buf.slice(0, 4).toString()).toBe('%PDF')
  })
})
