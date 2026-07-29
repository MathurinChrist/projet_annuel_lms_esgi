import { tutorChat, tutorExplain, tutorPracticeQuiz } from '../../../utils/aiTutor'
import { AUTHORIZED_ROLES, ensureRole } from '../../../utils/auth'

function stripHtml(html: string) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function loadLessonContext(userId: number, lessonId: number) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            select: { id: true, title: true, published: true, isPublic: true },
          },
        },
      },
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' }, select: { text: true } } },
      },
    },
  })

  if (!lesson?.module?.course) {
    throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable.' })
  }

  const course = lesson.module.course
  if (!course.published || !course.isPublic) {
    throw createError({ statusCode: 404, statusMessage: 'Cours introuvable.' })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  })
  if (!enrollment) {
    throw createError({ statusCode: 403, statusMessage: 'Inscrivez-vous au cours pour utiliser le tuteur IA.' })
  }

  const quizBits = (lesson.questions || [])
    .map((q, i) => {
      const opts = (q.options || []).map(o => `- ${o.text}`).join('\n')
      return `Q${i + 1}. ${q.text}\n${opts}`
    })
    .join('\n\n')

  const contentParts = [
    stripHtml(lesson.content || ''),
    lesson.url ? `Ressource / URL : ${lesson.url}` : '',
    quizBits ? `Questions déjà présentes dans la leçon (ne pas spoiler les bonnes réponses) :\n${quizBits}` : '',
  ].filter(Boolean)

  return {
    courseTitle: course.title,
    moduleTitle: lesson.module.title,
    lessonTitle: lesson.title,
    lessonType: lesson.type,
    lessonContent: contentParts.join('\n\n') || `Leçon « ${lesson.title} » du module « ${lesson.module.title} ».`,
  }
}

export default defineEventHandler(async (event) => {
  ensureRole(event, AUTHORIZED_ROLES.LEARNER)
  const { userId } = (event.context as any).auth

  const body = await readBody(event)
  const mode = String(body?.mode || '').trim() // explain | chat | practice
  const lessonId = Number(body?.lessonId)
  const language = body?.language === 'en' ? 'en' : 'fr'

  if (!lessonId || Number.isNaN(lessonId)) {
    throw createError({ statusCode: 400, statusMessage: 'lessonId requis.' })
  }

  const context = await loadLessonContext(userId, lessonId)

  if (mode === 'explain') {
    const { reply } = await tutorExplain({ context, language })
    return { mode, reply }
  }

  if (mode === 'chat') {
    const message = String(body?.message || '').trim()
    const history = Array.isArray(body?.history) ? body.history : []
    const { reply } = await tutorChat({ context, message, history, language })
    return { mode, reply }
  }

  if (mode === 'practice') {
    const questionCount = Number(body?.questionCount) || 5
    const quiz = await tutorPracticeQuiz({ context, questionCount, language })
    return { mode, quiz }
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'mode invalide (explain | chat | practice).',
  })
})
