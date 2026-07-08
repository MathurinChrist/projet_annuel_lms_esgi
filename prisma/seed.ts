import 'dotenv/config'
import { PrismaClient, Role, LessonType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Nettoyage de la DB
    await prisma.enrollment.deleteMany()
    await prisma.lesson.deleteMany()
    await prisma.module.deleteMany()
    await prisma.course.deleteMany()
    await prisma.category.deleteMany()
    await prisma.passwordReset.deleteMany()
    await prisma.user.deleteMany()

    // Création des catégories
    const catDev = await prisma.category.create({
        data: { name: 'Développement', slug: 'developpement' }
    })
    const catDesign = await prisma.category.create({
        data: { name: 'Design', slug: 'design' }
    })

    // Création des utilisateurs
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
            bio: 'Expert en développement web avec 10 ans d\'expérience.'
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

    // Création d'un cours d'exemple
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
                                    slug: 'qu-est-ce-que-nuxt',
                                    content: 'Nuxt est un framework progressif basé sur Vue.js...',
                                    type: LessonType.TEXT,
                                    order: 1,
                                },
                                {
                                    title: 'Installation de Nuxt',
                                    slug: 'installation-nuxt',
                                    content: 'https://nuxt.com/docs/getting-started/installation',
                                    type: LessonType.VIDEO,
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

    // Inscription de l'apprenant au cours
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
    })
