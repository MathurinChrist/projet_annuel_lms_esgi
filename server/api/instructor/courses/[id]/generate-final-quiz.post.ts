import {
  generateFinalQuizFromModules,
  hasGeminiApiKey,
  summarizeYoutubeViaGemini,
} from '../../../../utils/aiQuiz'
import { extractYouTubeId, fetchYouTubeTranscript } from '../../../../utils/youtubeTranscript'

const MAX_VIDEO_ENRICH = 6

async function enrichVideoLesson(lesson: {
  title: string
  type: string
  url?: string | null
  content?: string | null
}) {
  if (lesson.type !== 'video' || !lesson.url || !extractYouTubeId(lesson.url)) {
    return { videoSummary: null as string | null, source: null as string | null }
  }

  try {
    const { transcript } = await fetchYouTubeTranscript(lesson.url)
    return {
      videoSummary: transcript.slice(0, 2000),
      source: 'transcript' as const,
    }
  } catch {
    if (!hasGeminiApiKey()) {
      return { videoSummary: null, source: null }
    }
    try {
      const summary = await summarizeYoutubeViaGemini({
        youtubeUrl: lesson.url,
        lessonTitle: lesson.title,
      })
      return { videoSummary: summary, source: 'gemini_video' as const }
    } catch {
      return { videoSummary: null, source: null }
    }
  }
}

export default defineEventHandler(async (event) => {
  ensureTrainer(event)

  const courseId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const questionCount = Number(body?.questionCount) || 8

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              questions: {
                orderBy: { order: 'asc' },
                include: { options: { orderBy: { order: 'asc' } } },
              },
            },
          },
        },
      },
    },
  })

  if (!course) {
    throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
  }

  // Enrichir les leçons vidéo YouTube (transcript, sinon Gemini qui « regarde » la vidéo)
  const youtubeLessons = course.modules
    .flatMap(m => m.lessons)
    .filter(l => l.type === 'video' && l.url && extractYouTubeId(l.url))
    .slice(0, MAX_VIDEO_ENRICH)

  const enrichMap = new Map<number, { videoSummary: string | null; source: string | null }>()
  const settled = await Promise.all(
    youtubeLessons.map(async (l) => {
      const result = await enrichVideoLesson(l)
      return { id: l.id, ...result }
    }),
  )
  for (const row of settled) {
    enrichMap.set(row.id, { videoSummary: row.videoSummary, source: row.source })
  }

  const quiz = await generateFinalQuizFromModules({
    courseTitle: course.title,
    questionCount,
    modules: course.modules.map(m => ({
      title: m.title,
      lessons: m.lessons.map(l => ({
        title: l.title,
        type: l.type,
        content: l.content,
        url: l.url,
        videoSummary: enrichMap.get(l.id)?.videoSummary || null,
        questions: l.questions.map(q => ({
          text: q.text,
          options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
        })),
      })),
    })),
  })

  await prisma.finalQuizQuestion.deleteMany({ where: { courseId } })

  for (let qi = 0; qi < quiz.questions.length; qi++) {
    const q = quiz.questions[qi]
    await prisma.finalQuizQuestion.create({
      data: {
        text: q.text,
        order: qi,
        courseId,
        options: {
          create: q.options.map((o, oi) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            order: oi,
          })),
        },
      },
    })
  }

  const saved = await prisma.finalQuizQuestion.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    include: { options: { orderBy: { order: 'asc' } } },
  })

  const videoSources = settled
    .filter(s => s.source)
    .map(s => ({ lessonId: s.id, source: s.source }))

  return {
    title: quiz.title,
    questionCount: saved.length,
    questions: saved,
    videoEnrichment: {
      attempted: youtubeLessons.length,
      withContent: videoSources.length,
      sources: videoSources,
    },
  }
})
