export type GeneratedQuizOption = { text: string; isCorrect: boolean }
export type GeneratedQuizQuestion = { text: string; options: GeneratedQuizOption[] }

export type GeneratedQuiz = {
  title: string
  questions: GeneratedQuizQuestion[]
}

async function getOpenAI() {
  const config = useRuntimeConfig()
  const apiKey = config.openaiApiKey as string
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      message: 'Clé OpenAI manquante. Ajoutez OPENAI_API_KEY dans votre fichier .env.',
    })
  }
  const { default: OpenAI } = await import('openai')
  return new OpenAI({ apiKey })
}

export function normalizeQuiz(raw: any, questionCount: number): GeneratedQuiz {
  const questions = (Array.isArray(raw?.questions) ? raw.questions : [])
    .slice(0, questionCount)
    .map((q: any) => {
      const options = (Array.isArray(q?.options) ? q.options : [])
        .slice(0, 5)
        .map((o: any) => ({
          text: String(o?.text ?? '').trim(),
          isCorrect: !!o?.isCorrect,
        }))
        .filter((o: GeneratedQuizOption) => o.text.length > 0)

      // Ensure exactly one correct answer
      const correctIdx = options.findIndex((o: GeneratedQuizOption) => o.isCorrect)
      if (correctIdx === -1 && options.length > 0) {
        options[0].isCorrect = true
      } else {
        options.forEach((o: GeneratedQuizOption, i: number) => {
          o.isCorrect = i === correctIdx
        })
      }

      return {
        text: String(q?.text ?? '').trim(),
        options,
      }
    })
    .filter((q: GeneratedQuizQuestion) => q.text && q.options.length >= 2)

  if (questions.length === 0) {
    throw createError({
      statusCode: 502,
      message: "L'IA n'a pas pu produire un quiz valide. Réessayez.",
    })
  }

  return {
    title: String(raw?.title ?? 'Quiz généré').trim() || 'Quiz généré',
    questions,
  }
}

function quizSystemPrompt(language: string, questionCount: number, source: 'transcript' | 'video') {
  const sourceRule = source === 'transcript'
    ? 'Questions basées UNIQUEMENT sur la transcription fournie'
    : 'Questions basées UNIQUEMENT sur le contenu de la vidéo YouTube fournie'
  return `Tu es un expert pédagogique qui crée des quiz QCM pour une plateforme LMS.
Réponds UNIQUEMENT en JSON valide avec ce schéma exact :
{
  "title": "string",
  "questions": [
    {
      "text": "string",
      "options": [
        { "text": "string", "isCorrect": boolean }
      ]
    }
  ]
}
Règles :
- Langue des questions/réponses : ${language}
- Exactement ${questionCount} questions
- 4 options par question
- Exactement 1 bonne réponse par question (isCorrect: true)
- ${sourceRule}
- Distractors plausibles mais clairement incorrects
- Niveau adapté à des apprenants en formation`
}

export function hasGeminiApiKey(): boolean {
  const config = useRuntimeConfig()
  const key = String(config.geminiApiKey || process.env.GEMINI_API_KEY || process.env.NUXT_GEMINI_API_KEY || '').trim()
  return key.length > 0
}

function getGeminiConfig() {
  const config = useRuntimeConfig()
  const apiKey = String(config.geminiApiKey || process.env.GEMINI_API_KEY || process.env.NUXT_GEMINI_API_KEY || '').trim()
  const model = String(config.geminiModel || process.env.GEMINI_MODEL || process.env.NUXT_GEMINI_MODEL || 'gemini-flash-latest').trim() || 'gemini-flash-latest'
  return { apiKey, model }
}

export async function generateQuizFromTranscript(opts: {
  transcript: string
  questionCount?: number
  courseTitle?: string
  lessonTitle?: string
  language?: string
}): Promise<GeneratedQuiz> {
  const questionCount = Math.min(Math.max(opts.questionCount ?? 5, 3), 10)
  const language = opts.language || 'fr'
  const openai = await getOpenAI()
  const model = (useRuntimeConfig().openaiModel as string) || 'gpt-4o-mini'

  const contextBits = [
    opts.courseTitle ? `Cours : ${opts.courseTitle}` : null,
    opts.lessonTitle ? `Leçon vidéo : ${opts.lessonTitle}` : null,
  ].filter(Boolean).join('\n')

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: quizSystemPrompt(language, questionCount, 'transcript'),
      },
      {
        role: 'user',
        content: `${contextBits ? contextBits + '\n\n' : ''}Transcription de la vidéo YouTube :\n\n${opts.transcript}`,
      },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw createError({
      statusCode: 502,
      statusMessage: "Réponse vide de l'IA. Réessayez.",
    })
  }

  let parsed: any
  try {
    parsed = JSON.parse(content)
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "L'IA a renvoyé un format invalide. Réessayez.",
    })
  }

  return normalizeQuiz(parsed, questionCount)
}

/** Fallback : Gemini lit la vidéo YouTube (quand les sous-titres sont inaccessibles). */
export async function generateQuizFromYoutubeViaGemini(opts: {
  youtubeUrl: string
  questionCount?: number
  courseTitle?: string
  lessonTitle?: string
  language?: string
}): Promise<GeneratedQuiz> {
  const { apiKey, model } = getGeminiConfig()
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Clé Gemini manquante. Ajoutez GEMINI_API_KEY dans le .env.',
      data: { code: 'GEMINI_MISSING' },
    })
  }

  const questionCount = Math.min(Math.max(opts.questionCount ?? 5, 3), 10)
  const language = opts.language || 'fr'

  const contextBits = [
    opts.courseTitle ? `Cours : ${opts.courseTitle}` : null,
    opts.lessonTitle ? `Leçon vidéo : ${opts.lessonTitle}` : null,
  ].filter(Boolean).join('\n')

  const prompt = `${quizSystemPrompt(language, questionCount, 'video')}
${contextBits ? `\nContexte :\n${contextBits}\n` : ''}
Analyse la vidéo YouTube (sujet, explications de l'auteur, notions clés) et produis le quiz JSON.`

  const payload = await callGeminiGenerateJson({
    apiKey,
    model,
    prompt,
    youtubeUrl: opts.youtubeUrl,
  })

  return normalizeQuiz(payload, questionCount)
}

/** Résumé textuel d'une vidéo YouTube via Gemini (pour enrichir l'examen final). */
export async function summarizeYoutubeViaGemini(opts: {
  youtubeUrl: string
  lessonTitle?: string
  language?: string
}): Promise<string> {
  const { apiKey, model } = getGeminiConfig()
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Clé Gemini manquante.',
      data: { code: 'GEMINI_MISSING' },
    })
  }

  const language = opts.language || 'fr'
  const titleBit = opts.lessonTitle ? ` (leçon : ${opts.lessonTitle})` : ''
  const prompt = `Tu analyses une vidéo pédagogique YouTube${titleBit}.
Langue de réponse : ${language}
Écris un résumé structuré (180–350 mots) de ce que dit / montre l'auteur :
- sujet principal
- notions clés expliquées
- étapes ou exemples importants
- points à retenir pour un examen
Réponds en texte clair, pas de JSON.`

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { file_data: { file_uri: opts.youtubeUrl } },
        ],
      }],
      generationConfig: { temperature: 0.3 },
    }),
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = String(payload?.error?.message || res.statusText || 'erreur Gemini')
    throw createError({
      statusCode: 502,
      statusMessage: `Gemini n'a pas pu analyser la vidéo : ${detail}`,
      data: { code: 'GEMINI_FAILED' },
    })
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text)
    .filter(Boolean)
    .join('\n')
    ?.trim()

  if (!text) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Résumé vidéo vide (Gemini).',
      data: { code: 'GEMINI_EMPTY' },
    })
  }

  return text.slice(0, 2500)
}

async function callGeminiGenerateJson(opts: {
  apiKey: string
  model: string
  prompt: string
  youtubeUrl: string
}) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: opts.prompt },
          { file_data: { file_uri: opts.youtubeUrl } },
        ],
      }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = String(payload?.error?.message || res.statusText || 'erreur Gemini')
    throw createError({
      statusCode: 502,
      statusMessage: `Gemini n'a pas pu analyser la vidéo : ${detail}`,
      data: { code: 'GEMINI_FAILED' },
    })
  }

  const content = payload?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text)
    .filter(Boolean)
    .join('\n')

  if (!content) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Réponse vide de Gemini. Réessayez.',
      data: { code: 'GEMINI_EMPTY' },
    })
  }

  try {
    return JSON.parse(content)
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Gemini a renvoyé un format invalide. Réessayez.',
      data: { code: 'GEMINI_INVALID' },
    })
  }
}

export async function explainWrongAnswers(opts: {
  courseTitle?: string
  lessonTitle?: string
  wrongItems: Array<{
    question: string
    selectedAnswer: string
    correctAnswer: string
  }>
  language?: string
}): Promise<Array<{ question: string; explanation: string }>> {
  if (!opts.wrongItems.length) return []

  const language = opts.language || 'fr'
  const openai = await getOpenAI()
  const model = (useRuntimeConfig().openaiModel as string) || 'gpt-4o-mini'

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Tu es un tuteur pédagogique bienveillant sur une plateforme LMS.
Pour chaque erreur, explique clairement pourquoi la réponse choisie est incorrecte et pourquoi la bonne réponse est juste.
Réponds UNIQUEMENT en JSON :
{
  "explanations": [
    { "question": "string (reprise exacte)", "explanation": "string (2-4 phrases)" }
  ]
}
Langue : ${language}
Ton : encourageant, clair, sans spoil inutile sur d'autres questions.`,
      },
      {
        role: 'user',
        content: `${opts.courseTitle ? `Cours : ${opts.courseTitle}\n` : ''}${opts.lessonTitle ? `Quiz : ${opts.lessonTitle}\n` : ''}
Erreurs de l'apprenant :
${JSON.stringify(opts.wrongItems, null, 2)}`,
      },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (!content) return opts.wrongItems.map(w => ({
    question: w.question,
    explanation: `La bonne réponse était « ${w.correctAnswer} ». Relisez la notion associée dans les vidéos du module.`,
  }))

  try {
    const parsed = JSON.parse(content)
    const list = Array.isArray(parsed?.explanations) ? parsed.explanations : []
    return opts.wrongItems.map((w) => {
      const match = list.find((e: any) => String(e?.question || '').trim() === w.question)
        || list.find((e: any) => String(e?.question || '').includes(w.question.slice(0, 40)))
      return {
        question: w.question,
        explanation: String(match?.explanation || '').trim()
          || `La réponse « ${w.selectedAnswer} » est incorrecte. La bonne réponse est « ${w.correctAnswer} ». Revoir les vidéos du module vous aidera à consolider cette notion.`,
      }
    })
  } catch {
    return opts.wrongItems.map(w => ({
      question: w.question,
      explanation: `La réponse « ${w.selectedAnswer} » est incorrecte. La bonne réponse est « ${w.correctAnswer} ».`,
    }))
  }
}

export async function generateFinalQuizFromModules(opts: {
  courseTitle: string
  modules: Array<{
    title: string
    lessons: Array<{
      title: string
      type: string
      content?: string | null
      url?: string | null
      videoSummary?: string | null
      questions?: Array<{
        text: string
        options: Array<{ text: string; isCorrect: boolean }>
      }>
    }>
  }>
  questionCount?: number
  language?: string
}): Promise<GeneratedQuiz> {
  const questionCount = Math.min(Math.max(opts.questionCount ?? 8, 5), 15)
  const language = opts.language || 'fr'
  const openai = await getOpenAI()
  const model = (useRuntimeConfig().openaiModel as string) || 'gpt-4o-mini'

  const synopsis = opts.modules.map((m, mi) => {
    const lines = [`Module ${mi + 1} — ${m.title}`]
    for (const l of m.lessons) {
      lines.push(`- [${l.type}] ${l.title}`)
      if (l.url) lines.push(`  URL: ${l.url}`)
      if (l.videoSummary) lines.push(`  Résumé vidéo (auteur): ${String(l.videoSummary).slice(0, 1200)}`)
      if (l.content) lines.push(`  Contenu: ${String(l.content).replace(/<[^>]+>/g, ' ').slice(0, 400)}`)
      if (l.questions?.length) {
        for (const q of l.questions) {
          const correct = q.options.find(o => o.isCorrect)?.text
          lines.push(`  QCM: ${q.text} → ${correct || '?'}`)
        }
      }
    }
    return lines.join('\n')
  }).join('\n\n').slice(0, 18000)

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.45,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Tu crées l'EXAMEN FINAL d'un cours LMS, couvrant TOUS les modules.
Réponds UNIQUEMENT en JSON :
{
  "title": "string",
  "questions": [
    {
      "text": "string",
      "options": [
        { "text": "string", "isCorrect": boolean }
      ]
    }
  ]
}
Règles :
- Langue : ${language}
- Exactement ${questionCount} questions
- 4 options, 1 seule bonne réponse
- Questions transverses qui synthétisent plusieurs modules
- Utilise aussi les résumés vidéo quand présents (ce que dit l'auteur)
- Niveau examen de validation finale`,
      },
      {
        role: 'user',
        content: `Cours : ${opts.courseTitle}\n\nContenu des modules :\n\n${synopsis}`,
      },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw createError({
      statusCode: 502,
      statusMessage: "Réponse vide de l'IA pour l'examen final.",
    })
  }

  let parsed: any
  try {
    parsed = JSON.parse(content)
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Format invalide pour l'examen final.",
    })
  }

  return normalizeQuiz(parsed, questionCount)
}
