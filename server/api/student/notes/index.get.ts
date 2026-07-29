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
  const query = getQuery(event)

  const courseId = query.courseId ? Number(query.courseId) : undefined
  const lessonId = query.lessonId ? Number(query.lessonId) : undefined
  const tag = typeof query.tag === 'string' ? query.tag.trim() : ''
  const unattached = query.unattached === '1' || query.unattached === 'true'
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const dateFrom = typeof query.dateFrom === 'string' ? query.dateFrom : ''
  const dateTo = typeof query.dateTo === 'string' ? query.dateTo : ''
  const sort = query.sort === 'oldest' ? 'oldest' : 'recent'
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))

  const where: any = { userId }

  if (unattached) {
    where.courseId = null
  } else {
    if (courseId) where.courseId = courseId
    if (lessonId) where.lessonId = lessonId
  }

  if (tag) where.tags = { has: tag }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      where.createdAt.lte = end
    }
  }

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      select: noteSelect,
      orderBy: { updatedAt: sort === 'oldest' ? 'asc' : 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.note.count({ where }),
  ])

  return { notes, total, page, limit }
})
