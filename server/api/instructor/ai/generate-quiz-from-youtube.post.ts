export default defineEventHandler(async (event) => {
  ensureTrainer(event)

  const body = await readBody(event)
  const url = String(body?.url ?? '').trim()
  const questionCount = Number(body?.questionCount) || 5
  const courseTitle = body?.courseTitle ? String(body.courseTitle) : undefined
  const lessonTitle = body?.lessonTitle ? String(body.lessonTitle) : undefined

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le lien YouTube est requis.',
    })
  }

  const { videoId, transcript } = await fetchYouTubeTranscript(url)
  const quiz = await generateQuizFromTranscript({
    transcript,
    questionCount,
    courseTitle,
    lessonTitle,
  })

  return {
    videoId,
    transcriptLength: transcript.length,
    quizTitle: quiz.title,
    questions: quiz.questions,
  }
})
