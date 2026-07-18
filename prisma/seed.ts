import pkg from '@prisma/client'
const { PrismaClient, Role } = pkg
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  await prisma.enrollment.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.user.deleteMany()

  const catDev = await prisma.category.create({
    data: { name: 'Développement', slug: 'developpement' }
  })
  await prisma.category.create({
    data: { name: 'Design', slug: 'design' }
  })

  const adminPassword = await bcrypt.hash('admin123', 10)
  const formateurPassword = await bcrypt.hash('formateur123', 10)
  const apprenantPassword = await bcrypt.hash('apprenant123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@edupulse.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'EduPulse',
      role: Role.ADMINISTRATEUR,
      emailVerified: true,
    },
  })

  const formateur = await prisma.user.create({
    data: {
      email: 'jean.formateur@edupulse.com',
      password: formateurPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: Role.FORMATEUR,
      emailVerified: true,
    },
  })

  const apprenant = await prisma.user.create({
    data: {
      email: 'marie.apprenant@edupulse.com',
      password: apprenantPassword,
      firstName: 'Marie',
      lastName: 'Curie',
      role: Role.APPRENANT,
      emailVerified: true,
    },
  })

  console.log(`Created users: ${admin.email}, ${formateur.email}, ${apprenant.email}`)

  const course = await prisma.course.create({
    data: {
      title: 'Introduction au développement Web avec Nuxt 4',
      slug: 'intro-nuxt-4',
      description: 'Apprenez les bases du framework Nuxt pour créer des applications web modernes.',
      published: true,
      authorId: formateur.id,
      categoryId: catDev.id,
      modules: {
        create: [
          {
            title: 'Module 1 : Les bases',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Qu\'est-ce que Nuxt ?',
                  content: 'Nuxt est un framework progressif basé sur Vue.js...',
                  type: 'TEXT',
                  order: 1,
                },
                {
                  title: 'Installation de Nuxt',
                  content: 'https://nuxt.com/docs/getting-started/installation',
                  type: 'VIDEO',
                  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 2,
                }
              ]
            }
          }
        ]
      }
    },
  })

  console.log(`Created course: ${course.title}`)

  await prisma.enrollment.create({
    data: {
      userId: apprenant.id,
      courseId: course.id,
      progress: 50,
    },
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
