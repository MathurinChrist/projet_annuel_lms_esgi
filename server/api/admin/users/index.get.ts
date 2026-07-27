export default defineEventHandler(async (event) => {
    ensureAdmin(event)

    const query = getQuery(event)
    const role = query.role as string
    const active = query.active === 'true' ? true : query.active === 'false' ? false : undefined
    const search = query.search as string
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 15

    const where: any = {}

    if (role) {
        where.role = role
    }

    if (active !== undefined) {
        where.active = active
    }

    if (search) {
        where.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
        ]
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                active: true,
                avatar: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ])

    return { users, total, page, limit }
})
