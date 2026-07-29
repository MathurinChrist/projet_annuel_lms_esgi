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

export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const body = await readBody<{
    title?: string
    content?: string
    tags?: string[]
    courseId?: number
    lessonId?: number
  }>(event)

  let courseId: number | null = null
  let lessonId: number | null = null

  if (body?.lessonId != null) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(body.lessonId) },
      select: { id: true, module: { select: { courseId: true } } },
    })
    if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })
    lessonId = lesson.id
    courseId = lesson.module.courseId
  } else if (body?.courseId != null) {
    const course = await prisma.course.findUnique({ where: { id: Number(body.courseId) }, select: { id: true } })
    if (!course) throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
    courseId = course.id
  }

  const title = body?.title?.trim() ? body.title.trim() : null
  const content = typeof body?.content === 'string' ? body.content : ''
  const tags = Array.isArray(body?.tags)
    ? [...new Set(body.tags.map((t) => String(t).trim()).filter(Boolean))]
    : []

  return prisma.note.create({
    data: { userId, title, content, tags, courseId, lessonId },
    select: noteSelect,
  })
})
