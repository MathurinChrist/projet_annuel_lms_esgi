export default defineEventHandler(async (event) => {
    ensureAdmin(event)

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID utilisateur manquant' })
    }

    if (typeof body.active !== 'boolean') {
        throw createError({ statusCode: 400, statusMessage: 'État d\'activation invalide (doit être un booléen)' })
    }

    const userId = parseInt(id)

    // On peut s'assurer que l'admin ne se désactive pas lui-même
    if (userId === event.context.auth.userId && !body.active) {
        throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez pas désactiver votre propre compte administrateur' })
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            active: body.active,
        },
        select: {
            id: true,
            email: true,
            active: true,
            role: true,
        },
    })

    return {
        message: `Utilisateur ${updatedUser.active ? 'activé' : 'désactivé'} avec succès`,
        user: updatedUser
    }
})
