export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  await prisma.course.delete({ where: { id } })
  return { success: true }
})
