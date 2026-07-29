import {
  extractYouTubeId,
  fetchYouTubeTranscript,
  normalizeTranscriptText,
} from '../../../utils/youtubeTranscript'
import {
  generateQuizFromTranscript,
  generateQuizFromYoutubeViaGemini,
  hasGeminiApiKey,
} from '../../../utils/aiQuiz'

export default defineEventHandler(async (event) => {
  ensureTrainer(event)

  const body = await readBody(event)
  const url = String(body?.url ?? '').trim()
  const pasted = String(body?.transcript ?? '').trim()
  const questionCount = Number(body?.questionCount) || 5
  const courseTitle = body?.courseTitle ? String(body.courseTitle) : undefined
  const lessonTitle = body?.lessonTitle ? String(body.lessonTitle) : undefined

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le lien YouTube est requis.',
    })
  }

  const videoId = extractYouTubeId(url)
  if (!videoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL YouTube invalide. Exemple : https://www.youtube.com/watch?v=…',
    })
  }

  let source: 'youtube_transcript' | 'pasted_transcript' | 'gemini_video' = 'youtube_transcript'
  let transcriptLength = 0
  let quiz

  if (pasted.length >= 80) {
    const transcript = normalizeTranscriptText(pasted)
    transcriptLength = transcript.length
    source = 'pasted_transcript'
    quiz = await generateQuizFromTranscript({
      transcript,
      questionCount,
      courseTitle,
      lessonTitle,
    })
  } else {
    try {
      const fetched = await fetchYouTubeTranscript(url)
      transcriptLength = fetched.transcript.length
      source = 'youtube_transcript'
      quiz = await generateQuizFromTranscript({
        transcript: fetched.transcript,
        questionCount,
        courseTitle,
        lessonTitle,
      })
    } catch (err: any) {
      const code = err?.data?.code || ''
      const blocked = code === 'YOUTUBE_IP_BLOCKED' || /bloque|datacenter|disabled on this video/i.test(String(err?.statusMessage || err?.message || ''))

      if (blocked && hasGeminiApiKey()) {
        source = 'gemini_video'
        quiz = await generateQuizFromYoutubeViaGemini({
          youtubeUrl: url,
          questionCount,
          courseTitle,
          lessonTitle,
        })
      } else {
        throw err
      }
    }
  }

  return {
    videoId,
    transcriptLength,
    source,
    quizTitle: quiz.title,
    questions: quiz.questions,
  }
})
