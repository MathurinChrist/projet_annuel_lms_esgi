export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.token || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Token et mot de passe requis' })
  }

  if (body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Le mot de passe doit contenir au moins 8 caractères' })
  }

  const passwordReset = await prisma.passwordReset.findUnique({
    where: { token: body.token },
  })

  if (!passwordReset) {
    throw createError({ statusCode: 400, statusMessage: 'Token invalide ou expiré' })
  }

  if (passwordReset.used) {
    throw createError({ statusCode: 400, statusMessage: 'Ce lien a déjà été utilisé' })
  }

  if (passwordReset.expiresAt < new Date()) {
    throw createError({ statusCode: 400, statusMessage: 'Token invalide ou expiré' })
  }

  const hashedPassword = await hashPassword(body.password)

  await prisma.$transaction([
    prisma.user.update({
      where: { email: passwordReset.email },
      data: { password: hashedPassword },
    }),
    prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true },
    }),
  ])

  return { message: 'Mot de passe réinitialisé avec succès' }
})
