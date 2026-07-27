export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth

  if (!auth?.userId) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const body = await readBody(event)

  if (!body.currentPassword || !body.newPassword) {
    throw createError({ statusCode: 400, message: 'Ancien et nouveau mot de passe requis' })
  }

  if (String(body.newPassword).length < 8) {
    throw createError({ statusCode: 400, message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
  }

  if (body.newPassword !== body.confirmPassword) {
    throw createError({ statusCode: 400, message: 'La confirmation ne correspond pas au nouveau mot de passe' })
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
  })

  if (!user || !user.password) {
    throw createError({ statusCode: 404, message: 'Utilisateur introuvable ou compte Google sans mot de passe' })
  }

  const isValid = await comparePassword(body.currentPassword, user.password)
  if (!isValid) {
    throw createError({ statusCode: 401, message: 'Ancien mot de passe incorrect' })
  }

  const hashedPassword = await hashPassword(body.newPassword)

  await prisma.user.update({
    where: { id: auth.userId },
    data: { password: hashedPassword },
  })

  return { message: 'Mot de passe mis à jour avec succès' }
})
