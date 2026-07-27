export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

  const param = getRouterParam(event, 'id')!
  const isNumeric = /^\d+$/.test(param)

  const course = await prisma.course.findUnique({
    where: isNumeric ? { id: Number(param) } : { slug: param },
    include: {
      category: true,
      subCategory: true,
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { questions: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } } },
          },
        },
      },
      _count: { select: { finalQuizQuestions: true } },
    },
  })

  if (!course) throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
  const { _count, ...rest } = course
  return {
    ...rest,
    finalQuizQuestionCount: _count.finalQuizQuestions,
  }
})
