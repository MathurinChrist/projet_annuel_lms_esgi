export default defineEventHandler(async (event) => {
  const moduleId = Number(getRouterParam(event, 'id'))
  await prisma.module.delete({ where: { id: moduleId } })
  return { success: true }
})
