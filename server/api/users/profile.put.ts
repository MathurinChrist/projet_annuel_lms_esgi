export default defineEventHandler(async (event) => {
    const auth = event.context.auth

    if (!auth?.userId) {
        throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
    }

    const body = await readBody(event)

    // Validation minimaliste
    if (body.email && !body.email.includes('@')) {
        throw createError({ statusCode: 400, statusMessage: 'Email invalide' })
    }

    // Interdire la mise à jour des rôles via cet endpoint (sécurité)
    if (body.role && body.role !== auth.role) {
        throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez pas changer votre propre rôle' })
    }

    const updatedUser = await prisma.user.update({
        where: { id: auth.userId },
        data: {
            firstName: body.firstName,
            lastName: body.lastName,
            avatar: body.avatar,
            bio: body.bio,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            bio: true,
        },
    })

    return {
        message: 'Profil mis à jour avec succès',
        user: updatedUser
    }
})
