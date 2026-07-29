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
    let transcriptError: any = null
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
      transcriptError = err
    }

    if (!quiz) {
      // Transcription inaccessible → Gemini « regarde » la vidéo
      if (!hasGeminiApiKey()) {
        throw createError({
          statusCode: 422,
          statusMessage:
            transcriptError?.statusMessage
            || 'Transcription YouTube inaccessible. Ajoutez GEMINI_API_KEY pour que l’agent analyse la vidéo, ou collez la transcription.',
          data: { code: transcriptError?.data?.code || 'TRANSCRIPT_UNAVAILABLE' },
        })
      }

      try {
        source = 'gemini_video'
        quiz = await generateQuizFromYoutubeViaGemini({
          youtubeUrl: url,
          questionCount,
          courseTitle,
          lessonTitle,
        })
      } catch (geminiErr: any) {
        throw createError({
          statusCode: geminiErr?.statusCode || 502,
          statusMessage:
            geminiErr?.statusMessage
            || transcriptError?.statusMessage
            || 'Impossible de générer le quiz (transcription et analyse vidéo en échec).',
          data: { code: geminiErr?.data?.code || 'GEMINI_FAILED' },
        })
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
