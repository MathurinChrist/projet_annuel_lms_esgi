import pkg from '@prisma/client'
const { PrismaClient } = pkg
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      email: 'formateur@edupulse.fr',
      password: 'hashed_password_placeholder',
      firstName: 'Jean',
      lastName: 'Formateur',
      role: 'FORMATEUR',
    },
  })

  // Catégories parentes
  const catWeb = await prisma.category.upsert({
    where: { slug: 'web' },
    update: {},
    create: { name: 'Développement Web', slug: 'web', order: 1 },
  })
  const catData = await prisma.category.upsert({
    where: { slug: 'data' },
    update: {},
    create: { name: 'Data Science', slug: 'data', order: 2 },
  })
  const catBusiness = await prisma.category.upsert({
    where: { slug: 'business' },
    update: {},
    create: { name: 'Business', slug: 'business', order: 3 },
  })
  const catDesign = await prisma.category.upsert({
    where: { slug: 'design' },
    update: {},
    create: { name: 'Design', slug: 'design', order: 4 },
  })
  const catMarketing = await prisma.category.upsert({
    where: { slug: 'marketing' },
    update: {},
    create: { name: 'Marketing', slug: 'marketing', order: 5 },
  })

  // Sous-catégories de Développement Web
  await prisma.category.upsert({
    where: { slug: 'nuxt' },
    update: {},
    create: { name: 'Vue.js / Nuxt', slug: 'nuxt', order: 1, parentId: catWeb.id },
  })
  await prisma.category.upsert({
    where: { slug: 'react' },
    update: {},
    create: { name: 'React', slug: 'react', order: 2, parentId: catWeb.id },
  })
  await prisma.category.upsert({
    where: { slug: 'backend' },
    update: {},
    create: { name: 'Développement Backend', slug: 'backend', order: 3, parentId: catWeb.id },
  })
  await prisma.category.upsert({
    where: { slug: 'devops' },
    update: {},
    create: { name: 'DevOps & Cloud', slug: 'devops', order: 4, parentId: catWeb.id },
  })

  // Sous-catégories de Data Science
  await prisma.category.upsert({
    where: { slug: 'machine-learning' },
    update: {},
    create: { name: 'Machine Learning', slug: 'machine-learning', order: 1, parentId: catData.id },
  })
  await prisma.category.upsert({
    where: { slug: 'python-data' },
    update: {},
    create: { name: 'Python pour la Data', slug: 'python-data', order: 2, parentId: catData.id },
  })
  await prisma.category.upsert({
    where: { slug: 'visualisation' },
    update: {},
    create: { name: 'Visualisation de données', slug: 'visualisation', order: 3, parentId: catData.id },
  })

  // Sous-catégories Business
  await prisma.category.upsert({
    where: { slug: 'entrepreneuriat' },
    update: {},
    create: { name: 'Entrepreneuriat', slug: 'entrepreneuriat', order: 1, parentId: catBusiness.id },
  })
  await prisma.category.upsert({
    where: { slug: 'management' },
    update: {},
    create: { name: 'Management', slug: 'management', order: 2, parentId: catBusiness.id },
  })

  // Sous-catégories Design
  await prisma.category.upsert({
    where: { slug: 'ui-ux' },
    update: {},
    create: { name: 'UI / UX', slug: 'ui-ux', order: 1, parentId: catDesign.id },
  })
  await prisma.category.upsert({
    where: { slug: 'figma' },
    update: {},
    create: { name: 'Figma', slug: 'figma', order: 2, parentId: catDesign.id },
  })

  // Sous-catégories Marketing
  await prisma.category.upsert({
    where: { slug: 'seo' },
    update: {},
    create: { name: 'SEO', slug: 'seo', order: 1, parentId: catMarketing.id },
  })
  await prisma.category.upsert({
    where: { slug: 'reseaux-sociaux' },
    update: {},
    create: { name: 'Réseaux sociaux', slug: 'reseaux-sociaux', order: 2, parentId: catMarketing.id },
  })

  console.log('Seed terminé : utilisateur formateur + catégories créés')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
