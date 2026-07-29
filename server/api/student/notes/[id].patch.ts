const noteSelect = {
  id: true,
  title: true,
  content: true,
  tags: true,
  courseId: true,
  lessonId: true,
  createdAt: true,
  updatedAt: true,
  course: { select: { id: true, slug: true, title: true } },
  lesson: { select: { id: true, title: true } },
} as const

function has(body: any, key: string) {
  return Object.prototype.hasOwnProperty.call(body ?? {}, key)
}

export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    title?: string | null
    content?: string
    tags?: string[]
    courseId?: number | null
    lessonId?: number | null
  }>(event)

  const existing = await prisma.note.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Note introuvable' })
  if (existing.userId !== userId) throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez modifier que vos propres notes' })

  const data: any = {}

  if (has(body, 'title')) {
    data.title = body.title?.trim() ? body.title.trim() : null
  }
  if (has(body, 'content')) {
    data.content = typeof body.content === 'string' ? body.content : ''
  }
  if (has(body, 'tags')) {
    data.tags = Array.isArray(body.tags)
      ? [...new Set(body.tags.map((t) => String(t).trim()).filter(Boolean))]
      : []
  }

  const lessonIdProvided = has(body, 'lessonId')
  const courseIdProvided = has(body, 'courseId')
  let lessonJustDerived = false

  if (lessonIdProvided) {
    if (body.lessonId != null) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: Number(body.lessonId) },
        select: { id: true, module: { select: { courseId: true } } },
      })
      if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })
      data.lessonId = lesson.id
      data.courseId = lesson.module.courseId
      lessonJustDerived = true
    } else {
      // Détache uniquement la leçon ; le cours (s'il existe) est conservé sauf indication contraire.
      data.lessonId = null
    }
  }

  if (courseIdProvided && !lessonJustDerived) {
    if (body.courseId == null) {
      // Détacher le cours implique de détacher la leçon (une leçon ne peut exister sans son cours).
      data.courseId = null
      data.lessonId = null
    } else {
      const courseId = Number(body.courseId)
      const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
      if (!course) throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
      data.courseId = courseId

      const currentLessonId = lessonIdProvided ? data.lessonId : existing.lessonId
      if (currentLessonId) {
        const lesson = await prisma.lesson.findUnique({
          where: { id: currentLessonId },
          select: { module: { select: { courseId: true } } },
        })
        if (!lesson || lesson.module.courseId !== courseId) {
          data.lessonId = null
        }
      }
    }
  }

  const note = await prisma.note.update({ where: { id }, data, select: noteSelect })
  return note
})
