export default defineEventHandler(async (event) => {
  const lessonId = Number(getRouterParam(event, 'id'))
  await prisma.lesson.delete({ where: { id: lessonId } })
  return { success: true }
})
