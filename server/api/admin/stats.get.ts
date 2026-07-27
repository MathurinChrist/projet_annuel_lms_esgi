export default defineEventHandler(async (event) => {
  ensureAdmin(event)

  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    activeUsers,
    usersByRole,
    publishedCourses,
    draftCourses,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    prisma.course.count({ where: { published: true } }),
    prisma.course.count({ where: { published: false } }),
  ])

  const roleStats = {
    ADMINISTRATEUR: 0,
    FORMATEUR: 0,
    APPRENANT: 0,
  }

  usersByRole.forEach((item) => {
    roleStats[item.role as keyof typeof roleStats] = item._count.role
  })

  return {
    totalUsers,
    totalCourses,
    totalEnrollments,
    activeUsers,
    usersByRole: roleStats,
    publishedCourses,
    draftCourses,
  }
})
