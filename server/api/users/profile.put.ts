export default defineEventHandler(async (event) => {
  const auth = (event.context as any).auth

  if (!auth?.userId) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const body = await readBody(event)

  const data: Record<string, unknown> = {}

  if (body.firstName !== undefined) {
    const firstName = String(body.firstName || '').trim()
    if (firstName.length < 1) {
      throw createError({ statusCode: 400, message: 'Le prénom est requis.' })
    }
    data.firstName = firstName
  }

  if (body.lastName !== undefined) {
    const lastName = String(body.lastName || '').trim()
    if (lastName.length < 1) {
      throw createError({ statusCode: 400, message: 'Le nom est requis.' })
    }
    data.lastName = lastName
  }

  if (body.avatar !== undefined) {
    data.avatar = body.avatar ? String(body.avatar).trim() : null
  }

  if (body.loginAlerts !== undefined) {
    data.loginAlerts = !!body.loginAlerts
  }

  if (Object.keys(data).length === 0) {
    throw createError({ statusCode: 400, message: 'Aucune modification à enregistrer.' })
  }

  const updatedUser = await prisma.user.update({
    where: { id: auth.userId },
    data,
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

  return {
    message: 'Profil mis à jour avec succès',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      emailVerified: updatedUser.emailVerified,
      loginAlerts: updatedUser.loginAlerts,
      hasPassword: !!updatedUser.password,
      hasGoogle: !!updatedUser.googleId,
      createdAt: updatedUser.createdAt,
    },
  }
})
