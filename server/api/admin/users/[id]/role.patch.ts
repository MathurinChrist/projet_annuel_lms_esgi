export default defineEventHandler(async (event) => {
  ensureAdmin(event)

  const userId = Number(getRouterParam(event, 'id'))
  const { role } = await readBody(event)
  const auth = (event.context as any).auth

  if (!role || !['ADMINISTRATEUR', 'FORMATEUR', 'APPRENANT'].includes(role)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rôle invalide',
    })
  }

  if (userId === auth.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Vous ne pouvez pas modifier votre propre rôle',
    })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
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
  })

  return { user }
})
