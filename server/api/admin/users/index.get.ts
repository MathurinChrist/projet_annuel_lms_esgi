export default defineEventHandler(async (event) => {
    // Seul un admin peut lister tous les utilisateurs
    ensureAdmin(event)

    const query = getQuery(event)
    const role = query.role as string
    const active = query.active === 'true' ? true : query.active === 'false' ? false : undefined

    const users = await prisma.user.findMany({
        where: {
            role: role ? (role as any) : undefined,
            active: active,
        },
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
    })

    return { users }
})
