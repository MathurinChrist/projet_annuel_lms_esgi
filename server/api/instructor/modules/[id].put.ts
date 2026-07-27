export default defineEventHandler(async (event) => {
  const moduleId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  return prisma.module.update({
    where: { id: moduleId },
    data: {
      title: body.title?.trim() ?? undefined,
      order: body.order ?? undefined,
    },
  })
})
