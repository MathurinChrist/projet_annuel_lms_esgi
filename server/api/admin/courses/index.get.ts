export default defineEventHandler(async (event) => {
  ensureAdmin(event)

  const query = getQuery(event)
  const search = query.search as string
  const status = query.status as string
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 15

  const where: any = {}

  if (search) {
    where.title = { contains: search, mode: 'insensitive' }
  }

  if (status === 'PUBLISHED') {
    where.published = true
  } else if (status === 'DRAFT') {
    where.published = false
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        status: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.course.count({ where }),
  ])

  return { courses, total, page, limit }
})
