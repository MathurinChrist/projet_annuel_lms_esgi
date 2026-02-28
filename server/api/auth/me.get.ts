export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      active: true,
    },
  })

  if (!user || !user.active) {
    throw createError({ statusCode: 401, statusMessage: 'Utilisateur introuvable ou désactivé' })
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    },
  }
})
