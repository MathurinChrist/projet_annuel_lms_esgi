import { normalizeQuiz, type GeneratedQuiz } from './aiQuiz'

async function getOpenAI() {
  const config = useRuntimeConfig()
  const apiKey = String(config.openaiApiKey || process.env.OPENAI_API_KEY || '').trim()
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Clé OpenAI manquante. Ajoutez OPENAI_API_KEY dans votre fichier .env.',
    })
  }
  const { default: OpenAI } = await import('openai')
  return new OpenAI({ apiKey })
}

export type TutorContext = {
  courseTitle: string
  moduleTitle?: string
  lessonTitle?: string
  lessonType?: string
  lessonContent?: string
}

function contextBlock(ctx: TutorContext) {
  return [
    `Cours : ${ctx.courseTitle}`,
    ctx.moduleTitle ? `Module : ${ctx.moduleTitle}` : null,
    ctx.lessonTitle ? `Leçon : ${ctx.lessonTitle}` : null,
    ctx.lessonType ? `Type : ${ctx.lessonType}` : null,
    ctx.lessonContent ? `Contenu de la leçon :\n${ctx.lessonContent.slice(0, 10_000)}` : null,
  ].filter(Boolean).join('\n')
}

const GUARDRAILS = `Tu es un tuteur pédagogique bienveillant sur EduPulse LMS.
Règles STRICTES :
- Base-toi UNIQUEMENT sur le contexte de cours fourni
- Si l'info n'est pas dans le contexte, dis-le clairement et propose de revoir la leçon
- Ne révèle pas de réponses exactes de quiz officiels du cours
- Ton encourageant, clair, niveau formation`

export async function tutorExplain(opts: {
  context: TutorContext
  language?: string
}): Promise<{ reply: string }> {
  const language = opts.language || 'fr'
  const openai = await getOpenAI()
  const model = (useRuntimeConfig().openaiModel as string) || 'gpt-4o-mini'

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: `${GUARDRAILS}
Langue : ${language}
Explique la leçon en cours de façon structurée (résumé, points clés, pièges fréquents, mini conseil de révision).
Réponds en texte clair (pas de JSON). 180–350 mots max.`,
      },
      {
        role: 'user',
        content: `Explique-moi cette leçon pour m'aider à bien la comprendre.\n\n${contextBlock(opts.context)}`,
      },
    ],
  })

  const reply = completion.choices[0]?.message?.content?.trim()
  if (!reply) {
    throw createError({ statusCode: 502, statusMessage: 'Réponse vide du tuteur IA.' })
  }
  return { reply }
}

export async function tutorChat(opts: {
  context: TutorContext
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  language?: string
}): Promise<{ reply: string }> {
  const language = opts.language || 'fr'
  const openai = await getOpenAI()
  const model = (useRuntimeConfig().openaiModel as string) || 'gpt-4o-mini'
  const message = opts.message.trim().slice(0, 2000)
  if (message.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Message trop court.' })
  }

  const history = (opts.history || [])
    .slice(-8)
    .map(h => ({
      role: h.role as 'user' | 'assistant',
      content: String(h.content || '').slice(0, 1500),
    }))
    .filter(h => h.content)

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.45,
    messages: [
      {
        role: 'system',
        content: `${GUARDRAILS}
Langue : ${language}
Réponds de façon concise (80–220 mots) sauf si l'apprenant demande plus de détail.
Contexte du cours :
${contextBlock(opts.context)}`,
      },
      ...history,
      { role: 'user', content: message },
    ],
  })

  const reply = completion.choices[0]?.message?.content?.trim()
  if (!reply) {
    throw createError({ statusCode: 502, statusMessage: 'Réponse vide du tuteur IA.' })
  }
  return { reply }
}

export async function tutorPracticeQuiz(opts: {
  context: TutorContext
  questionCount?: number
  language?: string
}): Promise<GeneratedQuiz> {
  const language = opts.language || 'fr'
  const questionCount = Math.min(Math.max(opts.questionCount ?? 5, 3), 8)
  const openai = await getOpenAI()
  const model = (useRuntimeConfig().openaiModel as string) || 'gpt-4o-mini'

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.45,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `${GUARDRAILS}
Tu crées un quiz d'ENTRAÎNEMENT (non noté) pour l'apprenant.
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
- Questions basées UNIQUEMENT sur le contexte fourni
- Niveau révision / entraînement`,
      },
      {
        role: 'user',
        content: `Génère un quiz d'entraînement pour cette leçon.\n\n${contextBlock(opts.context)}`,
      },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw createError({ statusCode: 502, statusMessage: 'Quiz d’entraînement vide.' })
  }

  let parsed: any
  try {
    parsed = JSON.parse(content)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Format de quiz invalide.' })
  }

  return normalizeQuiz(parsed, questionCount)
}
