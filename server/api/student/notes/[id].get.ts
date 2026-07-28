const noteSelect = {
  id: true,
  userId: true,
  title: true,
  content: true,
  tags: true,
  courseId: true,
  lessonId: true,
  createdAt: true,
  updatedAt: true,
  course: { select: { id: true, slug: true, title: true } },
  lesson: { select: { id: true, title: true } },
} as const

export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const id = Number(getRouterParam(event, 'id'))

  const note = await prisma.note.findUnique({ where: { id }, select: noteSelect })
  if (!note) throw createError({ statusCode: 404, statusMessage: 'Note introuvable' })
  if (note.userId !== userId) throw createError({ statusCode: 403, statusMessage: "Vous n'avez pas accès à cette note" })

  return note
})
