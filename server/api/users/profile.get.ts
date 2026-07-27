export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth

  if (!auth?.userId) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
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
      emailVerified: true,
      loginAlerts: true,
      googleId: true,
      password: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      loginAlerts: user.loginAlerts,
      hasPassword: !!user.password,
      hasGoogle: !!user.googleId,
      createdAt: user.createdAt,
    },
  }
})
