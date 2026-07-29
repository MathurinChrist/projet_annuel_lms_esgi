function parseDurationMinutes(value: string | null | undefined): number {
  if (!value) return 0
  const match = value.match(/(\d+)\s*min/)
  return match ? parseInt(match[1]) : 0
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

  const userId = (event.context as any).auth?.userId || null
  const query = getQuery(event)

  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const categoryId = query.category ? Number(query.category) : null
  const difficulties = (Array.isArray(query.difficulty) ? query.difficulty : query.difficulty ? [query.difficulty] : [])
    .map(d => String(d).toUpperCase())
    .filter(d => ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(d))
  const duration = typeof query.duration === 'string' ? query.duration : ''
  const sort = typeof query.sort === 'string' ? query.sort : 'popular'
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(24, Math.max(1, Number(query.limit) || 9))

  const where: any = { published: true, isPublic: true }
  if (search) where.title = { contains: search, mode: 'insensitive' }
  if (categoryId) where.categoryId = categoryId
  if (difficulties.length) where.difficulty = { in: difficulties }

  const courses = await prisma.course.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      author: { select: { firstName: true, lastName: true } },
      modules: { select: { lessons: { select: { duration: true } } } },
      reviews: { select: { rating: true } },
      enrollments: userId ? { where: { userId }, select: { progress: true } } : { take: 0, select: { progress: true } },
      _count: { select: { enrollments: true } },
    },
  })

  let mapped = courses.map(c => {
    const lessons = c.modules.flatMap(m => m.lessons)
    const durationMinutes = lessons.reduce((sum, l) => sum + parseDurationMinutes(l.duration), 0)
    const reviewCount = c.reviews.length
    const rating = reviewCount ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0
    const enrollment = c.enrollments[0]

    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      coverImage: c.coverImage,
      difficulty: c.difficulty,
      tags: c.tags,
      category: c.category,
      author: c.author,
      lessonCount: lessons.length,
      durationMinutes,
      rating,
      reviewCount,
      enrollmentCount: c._count.enrollments,
      enrolled: !!enrollment,
      progress: enrollment?.progress ?? 0,
      createdAt: c.createdAt,
    }
  })

  if (duration === 'under2') mapped = mapped.filter(c => c.durationMinutes > 0 && c.durationMinutes < 120)
  else if (duration === '2to5') mapped = mapped.filter(c => c.durationMinutes >= 120 && c.durationMinutes <= 300)
  else if (duration === '5plus') mapped = mapped.filter(c => c.durationMinutes > 300)

  mapped.sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sort === 'rating') return b.rating - a.rating
    return b.enrollmentCount - a.enrollmentCount
  })

  const total = mapped.length
  const start = (page - 1) * limit
  const paged = mapped.slice(start, start + limit)

  return { courses: paged, total, page, limit }
})
