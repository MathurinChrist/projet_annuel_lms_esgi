export default defineEventHandler(async (event) => {
  const courseId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const last = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  return prisma.module.create({
    data: {
      title: body.title?.trim() || 'Nouveau module',
      order: (last?.order ?? -1) + 1,
      courseId,
    },
    include: { lessons: true },
  })
})
