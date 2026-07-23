import pkg from '@prisma/client'
const { PrismaClient, Role } = pkg
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const YT = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

type QuestionDef = { text: string; options: { text: string; isCorrect?: boolean }[] }
type LessonDef = { title: string; type: 'video' | 'text' | 'quiz' | 'pdf'; duration: string; content?: string; url?: string; questions?: QuestionDef[] }
type ModuleDef = { title: string; lessons: LessonDef[] }

function modulesData(defs: ModuleDef[]) {
  return {
    create: defs.map((m, mi) => ({
      title: m.title,
      order: mi + 1,
      lessons: {
        create: m.lessons.map((l, li) => ({
          title: l.title,
          type: l.type,
          duration: l.duration,
          content: l.content,
          url: l.url,
          order: li + 1,
          ...(l.questions
            ? {
                questions: {
                  create: l.questions.map((q, qi) => ({
                    text: q.text,
                    order: qi + 1,
                    options: {
                      create: q.options.map((o, oi) => ({ text: o.text, isCorrect: !!o.isCorrect, order: oi + 1 })),
                    },
                  })),
                },
              }
            : {}),
        })),
      },
    })),
  }
}

function cover(slug: string) {
  return `https://picsum.photos/seed/${slug}/640/400`
}

async function main() {
  console.log('Seeding database...')

  await prisma.lessonComment.deleteMany()
  await prisma.courseReview.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.questionOption.deleteMany()
  await prisma.question.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.user.deleteMany()

  const catDev = await prisma.category.create({ data: { name: 'Développement', slug: 'developpement' } })
  const catDesign = await prisma.category.create({ data: { name: 'Design', slug: 'design' } })
  const catMarketing = await prisma.category.create({ data: { name: 'Marketing', slug: 'marketing' } })
  const catData = await prisma.category.create({ data: { name: 'Data Science', slug: 'data-science' } })

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

  const jean = await prisma.user.create({
    data: {
      email: 'jean.formateur@edupulse.com',
      password: formateurPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: Role.FORMATEUR,
      emailVerified: true,
    },
  })

  const sophie = await prisma.user.create({
    data: {
      email: 'sophie.martin@edupulse.com',
      password: formateurPassword,
      firstName: 'Sophie',
      lastName: 'Martin',
      role: Role.FORMATEUR,
      emailVerified: true,
    },
  })

  const lucas = await prisma.user.create({
    data: {
      email: 'lucas.bernard@edupulse.com',
      password: formateurPassword,
      firstName: 'Lucas',
      lastName: 'Bernard',
      role: Role.FORMATEUR,
      emailVerified: true,
    },
  })

  const marie = await prisma.user.create({
    data: {
      email: 'marie.apprenant@edupulse.com',
      password: apprenantPassword,
      firstName: 'Marie',
      lastName: 'Curie',
      role: Role.APPRENANT,
      emailVerified: true,
    },
  })

  const paul = await prisma.user.create({
    data: {
      email: 'paul.girard@edupulse.com',
      password: apprenantPassword,
      firstName: 'Paul',
      lastName: 'Girard',
      role: Role.APPRENANT,
      emailVerified: true,
    },
  })

  const emma = await prisma.user.create({
    data: {
      email: 'emma.rousseau@edupulse.com',
      password: apprenantPassword,
      firstName: 'Emma',
      lastName: 'Rousseau',
      role: Role.APPRENANT,
      emailVerified: true,
    },
  })

  const nicolas = await prisma.user.create({
    data: {
      email: 'nicolas.lefevre@edupulse.com',
      password: apprenantPassword,
      firstName: 'Nicolas',
      lastName: 'Lefèvre',
      role: Role.APPRENANT,
      emailVerified: true,
    },
  })

  const chloe = await prisma.user.create({
    data: {
      email: 'chloe.moreau@edupulse.com',
      password: apprenantPassword,
      firstName: 'Chloé',
      lastName: 'Moreau',
      role: Role.APPRENANT,
      emailVerified: true,
    },
  })

  console.log(`Created users: ${[admin, jean, sophie, lucas, marie, paul, emma, nicolas, chloe].map(u => u.email).join(', ')}`)

  type CourseDef = {
    slug: string
    title: string
    description: string
    categoryId: number
    authorId: number
    difficulty: string
    tags: string[]
    published: boolean
    coverImage?: string
    modules: ModuleDef[]
  }

  const courseDefs: CourseDef[] = [
    // --- Développement (Jean) ---
    {
      slug: 'intro-nuxt-4',
      title: 'Introduction au développement Web avec Nuxt 4',
      description: 'Apprenez les bases du framework Nuxt pour créer des applications web modernes.',
      categoryId: catDev.id,
      authorId: jean.id,
      difficulty: 'BEGINNER',
      tags: ['nuxt', 'vue', 'web'],
      published: true,
      modules: [
        {
          title: 'Module 1 : Les bases',
          lessons: [
            { title: "Qu'est-ce que Nuxt ?", type: 'text', duration: '10 min', content: "Nuxt est un framework progressif basé sur Vue.js qui simplifie le rendu côté serveur, le routing et bien plus encore." },
            { title: 'Installation de Nuxt', type: 'video', duration: '8 min', url: YT, content: 'Suivez cette vidéo pour installer votre premier projet Nuxt 4.' },
            {
              title: 'Quiz : les fondamentaux',
              type: 'quiz',
              duration: '5 min',
              questions: [
                {
                  text: 'Sur quel framework Nuxt est-il basé ?',
                  options: [{ text: 'Vue.js', isCorrect: true }, { text: 'React' }, { text: 'Angular' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'typescript-js-developers',
      title: 'TypeScript pour les développeurs JavaScript',
      description: 'Passez de JavaScript à TypeScript et sécurisez votre code grâce au typage statique.',
      categoryId: catDev.id,
      authorId: jean.id,
      difficulty: 'INTERMEDIATE',
      tags: ['typescript', 'javascript'],
      published: true,
      coverImage: cover('typescript-js-developers'),
      modules: [
        {
          title: 'Module 1 : Les types de base',
          lessons: [
            { title: 'Pourquoi TypeScript ?', type: 'text', duration: '25 min', content: 'TypeScript ajoute un système de types statiques à JavaScript pour détecter les erreurs plus tôt.' },
            { title: 'Types primitifs et interfaces', type: 'video', duration: '25 min', url: YT },
          ],
        },
        {
          title: 'Module 2 : Aller plus loin',
          lessons: [
            { title: 'Génériques', type: 'text', duration: '25 min', content: 'Les génériques permettent de créer des composants réutilisables tout en gardant la sécurité du typage.' },
            { title: 'Configurer tsconfig.json', type: 'video', duration: '25 min', url: YT },
          ],
        },
      ],
    },
    {
      slug: 'react-fondamentaux',
      title: 'Les fondamentaux de React',
      description: 'Découvrez les composants, les hooks et la gestion d\'état avec React.',
      categoryId: catDev.id,
      authorId: jean.id,
      difficulty: 'BEGINNER',
      tags: ['react', 'javascript', 'frontend'],
      published: true,
      modules: [
        {
          title: 'Module 1 : Composants',
          lessons: [
            { title: 'JSX et composants', type: 'video', duration: '20 min', url: YT },
            { title: 'Props et state', type: 'text', duration: '20 min', content: 'Les props permettent de transmettre des données, le state gère les données internes au composant.' },
          ],
        },
        {
          title: 'Module 2 : Hooks',
          lessons: [
            { title: 'useState et useEffect', type: 'video', duration: '20 min', url: YT },
            { title: 'Hooks personnalisés', type: 'text', duration: '20 min', content: 'Créez vos propres hooks pour réutiliser une logique entre plusieurs composants.' },
          ],
        },
      ],
    },
    {
      slug: 'api-rest-node-express',
      title: 'API REST avec Node.js et Express',
      description: 'Construisez une API REST complète et sécurisée avec Node.js, Express et une base de données.',
      categoryId: catDev.id,
      authorId: jean.id,
      difficulty: 'INTERMEDIATE',
      tags: ['nodejs', 'express', 'api'],
      published: true,
      coverImage: cover('api-rest-node-express'),
      modules: [
        {
          title: 'Module 1 : Mise en place',
          lessons: [
            { title: 'Créer un serveur Express', type: 'video', duration: '60 min', url: YT },
            { title: 'Routing et middlewares', type: 'text', duration: '60 min', content: 'Express permet de définir des routes et d\'enchaîner des middlewares pour traiter les requêtes.' },
            { title: 'Gestion des erreurs', type: 'video', duration: '60 min', url: YT },
          ],
        },
        {
          title: 'Module 2 : Persistance des données',
          lessons: [
            { title: 'Connexion à une base de données', type: 'text', duration: '60 min', content: 'Utilisez un ORM pour interagir avec votre base de données de manière sûre et typée.' },
            { title: 'CRUD complet', type: 'video', duration: '60 min', url: YT },
            { title: 'Validation des entrées', type: 'text', duration: '60 min', content: 'Validez systématiquement les données reçues avant de les persister.' },
          ],
        },
      ],
    },
    {
      slug: 'postgresql-bases-donnees',
      title: 'Bases de données avec PostgreSQL',
      description: 'Maîtrisez le SQL et la modélisation de données relationnelles avec PostgreSQL.',
      categoryId: catDev.id,
      authorId: jean.id,
      difficulty: 'BEGINNER',
      tags: ['postgresql', 'sql', 'bases de données'],
      published: true,
      modules: [
        {
          title: 'Module 1 : Les bases du SQL',
          lessons: [
            { title: 'SELECT, WHERE, ORDER BY', type: 'video', duration: '20 min', url: YT },
            { title: 'Jointures', type: 'text', duration: '20 min', content: 'Les jointures permettent de combiner des données provenant de plusieurs tables.' },
          ],
        },
        {
          title: 'Module 2 : Modélisation',
          lessons: [
            { title: 'Clés primaires et étrangères', type: 'text', duration: '20 min', content: 'Une bonne modélisation relationnelle repose sur des clés bien définies et des contraintes d\'intégrité.' },
            { title: 'Index et performance', type: 'video', duration: '20 min', url: YT },
          ],
        },
      ],
    },
    {
      slug: 'docker-cicd-debutants',
      title: 'DevOps : Docker et CI/CD pour débutants',
      description: 'Conteneurisez vos applications avec Docker et automatisez vos déploiements avec une pipeline CI/CD.',
      categoryId: catDev.id,
      authorId: jean.id,
      difficulty: 'ADVANCED',
      tags: ['docker', 'devops', 'ci-cd'],
      published: true,
      coverImage: cover('docker-cicd-debutants'),
      modules: [
        {
          title: 'Module 1 : Docker',
          lessons: [
            { title: 'Images et conteneurs', type: 'video', duration: '55 min', url: YT },
            { title: 'Dockerfile', type: 'text', duration: '55 min', content: 'Le Dockerfile décrit les étapes de construction d\'une image Docker.' },
            { title: 'Docker Compose', type: 'video', duration: '55 min', url: YT },
          ],
        },
        {
          title: 'Module 2 : Intégration continue',
          lessons: [
            { title: 'Écrire une pipeline CI', type: 'text', duration: '55 min', content: 'Une pipeline CI exécute automatiquement vos tests à chaque push.' },
            { title: 'Déploiement continu', type: 'video', duration: '55 min', url: YT },
            { title: 'Bonnes pratiques', type: 'text', duration: '55 min', content: 'Séparez vos environnements et versionnez vos configurations d\'infrastructure.' },
          ],
        },
      ],
    },
    {
      slug: 'nuxt-4-avance-server-components',
      title: 'Nuxt 4 avancé : Server Components',
      description: 'Approfondissez Nuxt 4 avec les composants serveur et les stratégies de rendu avancées.',
      categoryId: catDev.id,
      authorId: jean.id,
      difficulty: 'ADVANCED',
      tags: ['nuxt', 'vue', 'ssr'],
      published: false,
      modules: [
        {
          title: 'Module 1 : Rendu avancé',
          lessons: [
            { title: 'Server Components', type: 'text', duration: '20 min', content: 'Brouillon : présentation des composants serveur de Nuxt 4.' },
          ],
        },
      ],
    },

    // --- Design (Sophie) ---
    {
      slug: 'design-ui-ux-introduction',
      title: 'Introduction au Design UI/UX',
      description: 'Découvrez les principes fondamentaux du design d\'interface et d\'expérience utilisateur.',
      categoryId: catDesign.id,
      authorId: sophie.id,
      difficulty: 'BEGINNER',
      tags: ['ui', 'ux', 'design'],
      published: true,
      coverImage: cover('design-ui-ux-introduction'),
      modules: [
        {
          title: 'Module 1 : Principes de base',
          lessons: [
            { title: 'Qu\'est-ce que l\'UX ?', type: 'text', duration: '25 min', content: 'L\'UX design vise à optimiser le parcours et la satisfaction de l\'utilisateur.' },
            { title: 'Hiérarchie visuelle', type: 'video', duration: '25 min', url: YT },
          ],
        },
        {
          title: 'Module 2 : Recherche utilisateur',
          lessons: [
            { title: 'Personas et parcours utilisateurs', type: 'text', duration: '25 min', content: 'Les personas aident à représenter les besoins et attentes des utilisateurs cibles.' },
            { title: 'Tests utilisateurs', type: 'video', duration: '25 min', url: YT },
          ],
        },
      ],
    },
    {
      slug: 'maitriser-figma',
      title: 'Maîtriser Figma de A à Z',
      description: 'Devenez autonome sur Figma : composants, auto-layout, prototypage et collaboration.',
      categoryId: catDesign.id,
      authorId: sophie.id,
      difficulty: 'BEGINNER',
      tags: ['figma', 'ui', 'prototypage'],
      published: true,
      coverImage: cover('maitriser-figma'),
      modules: [
        {
          title: 'Module 1 : Prise en main',
          lessons: [
            { title: 'Interface et outils', type: 'video', duration: '30 min', url: YT },
            { title: 'Frames et calques', type: 'text', duration: '30 min', content: 'Les frames organisent votre espace de travail et facilitent la mise en page responsive.' },
            { title: 'Auto-layout', type: 'video', duration: '30 min', url: YT },
          ],
        },
        {
          title: 'Module 2 : Composants et prototypage',
          lessons: [
            { title: 'Composants et variantes', type: 'text', duration: '30 min', content: 'Les composants permettent de réutiliser des éléments d\'interface de façon cohérente.' },
            { title: 'Prototypage interactif', type: 'video', duration: '30 min', url: YT },
            { title: 'Collaboration en équipe', type: 'text', duration: '30 min', content: 'Figma facilite le travail collaboratif grâce aux commentaires et au partage en temps réel.' },
          ],
        },
      ],
    },
    {
      slug: 'design-system-theorie-pratique',
      title: 'Design System : théorie et pratique',
      description: 'Construisez un design system cohérent pour vos produits numériques.',
      categoryId: catDesign.id,
      authorId: sophie.id,
      difficulty: 'INTERMEDIATE',
      tags: ['design system', 'ui', 'composants'],
      published: true,
      modules: [
        {
          title: 'Module 1 : Fondations',
          lessons: [
            { title: 'Tokens de design', type: 'text', duration: '15 min', content: 'Les design tokens centralisent les couleurs, espacements et typographies de votre système.' },
            { title: 'Bibliothèque de composants', type: 'video', duration: '15 min', url: YT },
          ],
        },
        {
          title: 'Module 2 : Documentation',
          lessons: [
            { title: 'Documenter son design system', type: 'text', duration: '15 min', content: 'Une bonne documentation facilite l\'adoption du design system par les équipes.' },
            { title: 'Gouvernance et versions', type: 'video', duration: '15 min', url: YT },
          ],
        },
      ],
    },
    {
      slug: 'motion-design-web',
      title: 'Motion Design pour le web',
      description: 'Ajoutez des animations fluides et pertinentes à vos interfaces web.',
      categoryId: catDesign.id,
      authorId: sophie.id,
      difficulty: 'INTERMEDIATE',
      tags: ['motion design', 'animation', 'ui'],
      published: true,
      coverImage: cover('motion-design-web'),
      modules: [
        {
          title: 'Module 1 : Principes d\'animation',
          lessons: [
            { title: 'Les 12 principes de l\'animation', type: 'video', duration: '22 min', url: YT },
            { title: 'Easing et timing', type: 'text', duration: '22 min', content: 'Le choix des courbes d\'accélération influence fortement la perception d\'une animation.' },
          ],
        },
        {
          title: 'Module 2 : Mise en pratique',
          lessons: [
            { title: 'Micro-interactions', type: 'text', duration: '22 min', content: 'Les micro-interactions renforcent le feedback perçu par l\'utilisateur.' },
            { title: 'Prototyper une animation', type: 'video', duration: '22 min', url: YT },
          ],
        },
      ],
    },
    {
      slug: 'design-interfaces-mobiles-figma',
      title: 'Design d\'interfaces mobiles avec Figma',
      description: 'Concevez des interfaces mobiles natives en respectant les guidelines iOS et Android.',
      categoryId: catDesign.id,
      authorId: sophie.id,
      difficulty: 'INTERMEDIATE',
      tags: ['figma', 'mobile', 'ui'],
      published: false,
      modules: [
        {
          title: 'Module 1 : Guidelines mobiles',
          lessons: [
            { title: 'Human Interface Guidelines vs Material Design', type: 'text', duration: '15 min', content: 'Brouillon : comparaison des guidelines iOS et Android.' },
          ],
        },
      ],
    },

    // --- Marketing (Sophie) ---
    {
      slug: 'marketing-digital-fondamentaux',
      title: 'Marketing Digital : les fondamentaux',
      description: 'Comprenez les leviers essentiels du marketing digital pour développer votre audience.',
      categoryId: catMarketing.id,
      authorId: sophie.id,
      difficulty: 'BEGINNER',
      tags: ['marketing', 'digital'],
      published: true,
      modules: [
        {
          title: 'Module 1 : Les leviers du marketing digital',
          lessons: [
            { title: 'SEO, SEA, réseaux sociaux', type: 'video', duration: '18 min', url: YT },
            { title: 'Construire une stratégie de contenu', type: 'text', duration: '18 min', content: 'Une stratégie de contenu efficace répond aux besoins et questions de votre audience.' },
          ],
        },
        {
          title: 'Module 2 : Mesurer ses résultats',
          lessons: [
            { title: 'KPIs essentiels', type: 'text', duration: '18 min', content: 'Suivez le trafic, le taux de conversion et le coût d\'acquisition pour piloter vos actions.' },
            { title: 'Outils d\'analyse', type: 'video', duration: '18 min', url: YT },
          ],
        },
      ],
    },
    {
      slug: 'seo-referencement-naturel',
      title: 'SEO : Optimiser son référencement naturel',
      description: 'Améliorez la visibilité de votre site sur les moteurs de recherche grâce au SEO.',
      categoryId: catMarketing.id,
      authorId: sophie.id,
      difficulty: 'INTERMEDIATE',
      tags: ['seo', 'referencement', 'marketing'],
      published: true,
      coverImage: cover('seo-referencement-naturel'),
      modules: [
        {
          title: 'Module 1 : SEO technique',
          lessons: [
            { title: 'Indexation et crawl', type: 'video', duration: '24 min', url: YT },
            { title: 'Performance et Core Web Vitals', type: 'text', duration: '24 min', content: 'La vitesse de chargement d\'un site influence directement son classement SEO.' },
          ],
        },
        {
          title: 'Module 2 : Contenu et netlinking',
          lessons: [
            { title: 'Rédiger pour le SEO', type: 'text', duration: '24 min', content: 'Un contenu de qualité, structuré autour de mots-clés pertinents, est la base d\'un bon référencement.' },
            { title: 'Stratégie de netlinking', type: 'video', duration: '24 min', url: YT },
          ],
        },
      ],
    },
    {
      slug: 'growth-hacking-startups',
      title: 'Growth Hacking pour startups',
      description: 'Adoptez les techniques de growth hacking pour accélérer la croissance de votre startup.',
      categoryId: catMarketing.id,
      authorId: sophie.id,
      difficulty: 'ADVANCED',
      tags: ['growth hacking', 'startup', 'marketing'],
      published: true,
      coverImage: cover('growth-hacking-startups'),
      modules: [
        {
          title: 'Module 1 : Le funnel AARRR',
          lessons: [
            { title: 'Acquisition et activation', type: 'video', duration: '55 min', url: YT },
            { title: 'Rétention et recommandation', type: 'text', duration: '55 min', content: 'Fidéliser un utilisateur coûte généralement moins cher que d\'en acquérir un nouveau.' },
            { title: 'Revenu et optimisation', type: 'video', duration: '55 min', url: YT },
          ],
        },
        {
          title: 'Module 2 : Expérimentation',
          lessons: [
            { title: 'Mettre en place des A/B tests', type: 'text', duration: '55 min', content: 'Les tests A/B permettent de valider des hypothèses avant de généraliser un changement.' },
            { title: 'Automatiser sa croissance', type: 'video', duration: '55 min', url: YT },
            { title: 'Étude de cas', type: 'text', duration: '55 min', content: 'Analyse d\'une startup ayant multiplié par 10 son acquisition en 6 mois.' },
          ],
        },
      ],
    },

    // --- Data Science (Lucas) ---
    {
      slug: 'data-science-python-introduction',
      title: 'Introduction à la Data Science avec Python',
      description: 'Démarrez en data science avec Python : manipulation de données, visualisation et statistiques.',
      categoryId: catData.id,
      authorId: lucas.id,
      difficulty: 'BEGINNER',
      tags: ['python', 'data science'],
      published: true,
      coverImage: cover('data-science-python-introduction'),
      modules: [
        {
          title: 'Module 1 : Python pour la data',
          lessons: [
            { title: 'Numpy et manipulation de tableaux', type: 'video', duration: '25 min', url: YT },
            { title: 'Introduction à Pandas', type: 'text', duration: '25 min', content: 'Pandas facilite la manipulation de données tabulaires en Python.' },
          ],
        },
        {
          title: 'Module 2 : Visualisation',
          lessons: [
            { title: 'Matplotlib et Seaborn', type: 'text', duration: '25 min', content: 'Une bonne visualisation aide à comprendre rapidement la structure de vos données.' },
            { title: 'Créer un tableau de bord', type: 'video', duration: '25 min', url: YT },
          ],
        },
      ],
    },
    {
      slug: 'machine-learning-bases',
      title: 'Machine Learning : les bases',
      description: 'Comprenez les algorithmes fondamentaux du machine learning et leurs cas d\'usage.',
      categoryId: catData.id,
      authorId: lucas.id,
      difficulty: 'INTERMEDIATE',
      tags: ['machine learning', 'python', 'data science'],
      published: true,
      coverImage: cover('machine-learning-bases'),
      modules: [
        {
          title: 'Module 1 : Apprentissage supervisé',
          lessons: [
            { title: 'Régression linéaire', type: 'video', duration: '30 min', url: YT },
            { title: 'Classification', type: 'text', duration: '30 min', content: 'La classification permet de prédire une catégorie parmi un ensemble fini de classes.' },
            { title: 'Évaluer un modèle', type: 'video', duration: '30 min', url: YT },
          ],
        },
        {
          title: 'Module 2 : Apprentissage non supervisé',
          lessons: [
            { title: 'Clustering K-means', type: 'text', duration: '30 min', content: 'Le clustering regroupe des données similaires sans étiquettes préalables.' },
            { title: 'Réduction de dimension', type: 'video', duration: '30 min', url: YT },
            {
              title: 'Quiz : concepts clés',
              type: 'quiz',
              duration: '10 min',
              questions: [
                {
                  text: 'Quel algorithme est utilisé pour le clustering ?',
                  options: [{ text: 'K-means', isCorrect: true }, { text: 'Régression linéaire' }, { text: 'Arbre de décision' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'analyse-donnees-pandas',
      title: 'Analyse de données avec Pandas',
      description: 'Approfondissez Pandas pour nettoyer, transformer et analyser des jeux de données réels.',
      categoryId: catData.id,
      authorId: lucas.id,
      difficulty: 'INTERMEDIATE',
      tags: ['pandas', 'python', 'data science'],
      published: true,
      modules: [
        {
          title: 'Module 1 : Nettoyage de données',
          lessons: [
            { title: 'Valeurs manquantes et doublons', type: 'video', duration: '20 min', url: YT },
            { title: 'Transformation de colonnes', type: 'text', duration: '20 min', content: 'Les fonctions apply et map permettent de transformer facilement des colonnes entières.' },
          ],
        },
        {
          title: 'Module 2 : Agrégation',
          lessons: [
            { title: 'GroupBy et pivots', type: 'text', duration: '20 min', content: 'GroupBy permet d\'agréger des données selon une ou plusieurs colonnes clés.' },
            { title: 'Fusionner plusieurs jeux de données', type: 'video', duration: '20 min', url: YT },
          ],
        },
      ],
    },
    {
      slug: 'introduction-intelligence-artificielle',
      title: 'Introduction à l\'Intelligence Artificielle',
      description: 'Explorez les concepts fondamentaux de l\'IA moderne, du machine learning aux réseaux de neurones.',
      categoryId: catData.id,
      authorId: lucas.id,
      difficulty: 'ADVANCED',
      tags: ['intelligence artificielle', 'deep learning'],
      published: true,
      coverImage: cover('introduction-intelligence-artificielle'),
      modules: [
        {
          title: 'Module 1 : Panorama de l\'IA',
          lessons: [
            { title: 'Histoire et grands concepts', type: 'video', duration: '23 min', url: YT },
            { title: 'IA, machine learning, deep learning', type: 'text', duration: '23 min', content: 'Le deep learning est un sous-ensemble du machine learning basé sur les réseaux de neurones.' },
          ],
        },
        {
          title: 'Module 2 : Réseaux de neurones',
          lessons: [
            { title: 'Fonctionnement d\'un neurone artificiel', type: 'text', duration: '23 min', content: 'Un neurone artificiel combine des entrées pondérées et une fonction d\'activation.' },
            { title: 'Entraîner un premier modèle', type: 'video', duration: '23 min', url: YT },
          ],
        },
      ],
    },
  ]

  const createdCourses: Record<string, { id: number }> = {}
  for (const def of courseDefs) {
    const course = await prisma.course.create({
      data: {
        title: def.title,
        slug: def.slug,
        description: def.description,
        categoryId: def.categoryId,
        authorId: def.authorId,
        difficulty: def.difficulty,
        tags: def.tags,
        coverImage: def.coverImage,
        published: def.published,
        status: def.published ? 'PUBLISHED' : 'DRAFT',
        isPublic: true,
        modules: modulesData(def.modules),
      },
    })
    createdCourses[def.slug] = course
  }

  console.log(`Created ${courseDefs.length} courses.`)

  // --- Inscriptions ---
  const enrollmentsData: { slug: string; userId: number; progress: number }[] = [
    { slug: 'intro-nuxt-4', userId: marie.id, progress: 50 },
    { slug: 'intro-nuxt-4', userId: paul.id, progress: 100 },
    { slug: 'intro-nuxt-4', userId: emma.id, progress: 20 },
    { slug: 'typescript-js-developers', userId: marie.id, progress: 30 },
    { slug: 'typescript-js-developers', userId: nicolas.id, progress: 75 },
    { slug: 'react-fondamentaux', userId: paul.id, progress: 10 },
    { slug: 'react-fondamentaux', userId: emma.id, progress: 60 },
    { slug: 'react-fondamentaux', userId: chloe.id, progress: 100 },
    { slug: 'api-rest-node-express', userId: nicolas.id, progress: 40 },
    { slug: 'postgresql-bases-donnees', userId: marie.id, progress: 90 },
    { slug: 'postgresql-bases-donnees', userId: chloe.id, progress: 15 },
    { slug: 'docker-cicd-debutants', userId: paul.id, progress: 5 },
    { slug: 'design-ui-ux-introduction', userId: emma.id, progress: 45 },
    { slug: 'design-ui-ux-introduction', userId: chloe.id, progress: 80 },
    { slug: 'maitriser-figma', userId: marie.id, progress: 100 },
    { slug: 'maitriser-figma', userId: emma.id, progress: 55 },
    { slug: 'maitriser-figma', userId: nicolas.id, progress: 10 },
    { slug: 'design-system-theorie-pratique', userId: chloe.id, progress: 25 },
    { slug: 'motion-design-web', userId: emma.id, progress: 65 },
    { slug: 'marketing-digital-fondamentaux', userId: paul.id, progress: 100 },
    { slug: 'marketing-digital-fondamentaux', userId: nicolas.id, progress: 35 },
    { slug: 'seo-referencement-naturel', userId: chloe.id, progress: 50 },
    { slug: 'growth-hacking-startups', userId: paul.id, progress: 20 },
    { slug: 'data-science-python-introduction', userId: marie.id, progress: 70 },
    { slug: 'data-science-python-introduction', userId: nicolas.id, progress: 90 },
    { slug: 'machine-learning-bases', userId: nicolas.id, progress: 40 },
    { slug: 'machine-learning-bases', userId: chloe.id, progress: 15 },
    { slug: 'analyse-donnees-pandas', userId: marie.id, progress: 60 },
    { slug: 'introduction-intelligence-artificielle', userId: nicolas.id, progress: 5 },
  ]

  for (const e of enrollmentsData) {
    await prisma.enrollment.create({
      data: { userId: e.userId, courseId: createdCourses[e.slug].id, progress: e.progress },
    })
  }

  console.log(`Created ${enrollmentsData.length} enrollments.`)

  // --- Avis ---
  const reviewsData: { slug: string; userId: number; rating: number; comment: string }[] = [
    { slug: 'intro-nuxt-4', userId: marie.id, rating: 5, comment: 'Parfait pour débuter avec Nuxt, très clair !' },
    { slug: 'intro-nuxt-4', userId: emma.id, rating: 4, comment: 'Bon contenu, j\'aurais aimé plus d\'exemples.' },
    { slug: 'typescript-js-developers', userId: nicolas.id, rating: 5, comment: 'Explications limpides sur les génériques.' },
    { slug: 'react-fondamentaux', userId: chloe.id, rating: 5, comment: 'Excellent cours, les hooks sont bien expliqués.' },
    { slug: 'react-fondamentaux', userId: emma.id, rating: 4, comment: 'Très complet.' },
    { slug: 'api-rest-node-express', userId: nicolas.id, rating: 4, comment: 'Bonne mise en pratique avec Express.' },
    { slug: 'postgresql-bases-donnees', userId: marie.id, rating: 5, comment: 'Les jointures n\'ont plus de secret pour moi.' },
    { slug: 'design-ui-ux-introduction', userId: chloe.id, rating: 5, comment: 'Super introduction, très accessible.' },
    { slug: 'maitriser-figma', userId: marie.id, rating: 5, comment: 'Je maîtrise enfin l\'auto-layout, merci !' },
    { slug: 'maitriser-figma', userId: emma.id, rating: 4, comment: 'Très utile au quotidien.' },
    { slug: 'motion-design-web', userId: emma.id, rating: 4, comment: 'Beaucoup d\'astuces pratiques.' },
    { slug: 'marketing-digital-fondamentaux', userId: paul.id, rating: 4, comment: 'Bonne vue d\'ensemble des leviers marketing.' },
    { slug: 'seo-referencement-naturel', userId: chloe.id, rating: 5, comment: 'J\'ai déjà vu des résultats sur mon site.' },
    { slug: 'growth-hacking-startups', userId: paul.id, rating: 5, comment: 'Le funnel AARRR expliqué simplement, top.' },
    { slug: 'data-science-python-introduction', userId: marie.id, rating: 5, comment: 'Idéal pour se lancer en data science.' },
    { slug: 'data-science-python-introduction', userId: nicolas.id, rating: 4, comment: 'Bon rythme, bien expliqué.' },
    { slug: 'machine-learning-bases', userId: nicolas.id, rating: 4, comment: 'Le clustering est enfin clair pour moi.' },
    { slug: 'analyse-donnees-pandas', userId: marie.id, rating: 5, comment: 'Très utile pour mon travail quotidien.' },
  ]

  for (const r of reviewsData) {
    await prisma.courseReview.create({
      data: { userId: r.userId, courseId: createdCourses[r.slug].id, rating: r.rating, comment: r.comment },
    })
  }

  console.log(`Created ${reviewsData.length} reviews.`)

  // --- Questions & réponses ---
  const coursesWithLessons = await prisma.course.findMany({
    where: { slug: { in: courseDefs.map(c => c.slug) } },
    select: { slug: true, authorId: true, modules: { orderBy: { order: 'asc' }, select: { order: true, lessons: { orderBy: { order: 'asc' }, select: { id: true, order: true } } } } },
  })

  function lessonAt(slug: string, moduleOrder: number, lessonOrder: number) {
    const course = coursesWithLessons.find(c => c.slug === slug)!
    const mod = course.modules.find(m => m.order === moduleOrder)!
    return mod.lessons.find(l => l.order === lessonOrder)!
  }

  const qaData: { slug: string; moduleOrder: number; lessonOrder: number; studentId: number; question: string; answer: string }[] = [
    {
      slug: 'intro-nuxt-4',
      moduleOrder: 1,
      lessonOrder: 2,
      studentId: marie.id,
      question: 'Faut-il utiliser Node 18 ou 20 pour installer Nuxt 4 ?',
      answer: 'Node 20 est recommandé, mais Node 18 fonctionne également très bien.',
    },
    {
      slug: 'typescript-js-developers',
      moduleOrder: 2,
      lessonOrder: 1,
      studentId: nicolas.id,
      question: 'Quelle est la différence entre un générique et le type `any` ?',
      answer: 'Contrairement à `any`, un générique conserve le typage précis tout en restant réutilisable pour différents types.',
    },
    {
      slug: 'react-fondamentaux',
      moduleOrder: 2,
      lessonOrder: 1,
      studentId: chloe.id,
      question: 'Peut-on appeler useEffect plusieurs fois dans un même composant ?',
      answer: 'Oui, vous pouvez avoir plusieurs useEffect, chacun gérant une préoccupation distincte.',
    },
    {
      slug: 'maitriser-figma',
      moduleOrder: 1,
      lessonOrder: 3,
      studentId: emma.id,
      question: 'L\'auto-layout fonctionne-t-il aussi sur des frames imbriquées ?',
      answer: 'Oui, vous pouvez imbriquer des frames en auto-layout pour créer des mises en page complexes.',
    },
    {
      slug: 'data-science-python-introduction',
      moduleOrder: 1,
      lessonOrder: 2,
      studentId: marie.id,
      question: 'Pandas est-il adapté pour de très gros volumes de données ?',
      answer: 'Pandas convient bien jusqu\'à quelques millions de lignes ; au-delà, des outils comme Polars ou Spark sont plus adaptés.',
    },
    {
      slug: 'machine-learning-bases',
      moduleOrder: 2,
      lessonOrder: 1,
      studentId: nicolas.id,
      question: 'Comment choisir le nombre de clusters pour un K-means ?',
      answer: 'La méthode du coude (elbow method) est une approche simple pour estimer un bon nombre de clusters.',
    },
    {
      slug: 'seo-referencement-naturel',
      moduleOrder: 1,
      lessonOrder: 2,
      studentId: chloe.id,
      question: 'Les Core Web Vitals impactent-ils vraiment le classement Google ?',
      answer: 'Oui, ce sont des critères officiels de classement depuis la Page Experience Update de Google.',
    },
  ]

  let qaCount = 0
  for (const qa of qaData) {
    const lesson = lessonAt(qa.slug, qa.moduleOrder, qa.lessonOrder)
    const question = await prisma.lessonComment.create({
      data: { userId: qa.studentId, lessonId: lesson.id, content: qa.question },
    })
    const authorId = coursesWithLessons.find(c => c.slug === qa.slug)!.authorId
    await prisma.lessonComment.create({
      data: { userId: authorId, lessonId: lesson.id, parentId: question.id, content: qa.answer },
    })
    qaCount += 2
  }

  console.log(`Created ${qaCount} lesson comments (Q&A).`)

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
