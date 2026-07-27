export default defineEventHandler(async (event) => {
  const { userId } = (event.context as any).auth
  const slug = getRouterParam(event, 'slug')!

  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true, published: true, isPublic: true },
  })

  if (!course || !course.published || !course.isPublic) {
    throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    update: {},
    create: { userId, courseId: course.id },
  })

  return { enrolled: true, progress: enrollment.progress }
})
