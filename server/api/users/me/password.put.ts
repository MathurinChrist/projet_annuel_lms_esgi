export default defineEventHandler(async (event) => {
    const auth = event.context.auth

    if (!auth?.userId) {
        throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
    }

    const body = await readBody(event)

    if (!body.currentPassword || !body.newPassword) {
        throw createError({ statusCode: 400, statusMessage: 'Ancien et nouveau mot de passe requis' })
    }

    if (body.newPassword.length < 8) {
        throw createError({ statusCode: 400, statusMessage: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
    }

    const user = await prisma.user.findUnique({
        where: { id: auth.userId }
    })

    if (!user || !user.password) {
        throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable ou compte Google' })
    }

    const isValid = await comparePassword(body.currentPassword, user.password)
    if (!isValid) {
        throw createError({ statusCode: 401, statusMessage: 'Ancien mot de passe incorrect' })
    }

    const hashedPassword = await hashPassword(body.newPassword)

    await prisma.user.update({
        where: { id: auth.userId },
        data: { password: hashedPassword }
    })

    return { message: 'Mot de passe mis à jour avec succès' }
})
