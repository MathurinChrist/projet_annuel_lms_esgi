import { prisma } from './prisma'

export async function recalculateEnrollmentProgress(userId: number, courseId: number) {
  const totalLessons = await prisma.lesson.count({ where: { module: { courseId } } })
  const completedLessons = await prisma.lessonProgress.count({
    where: { userId, lesson: { module: { courseId } } },
  })
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  await prisma.enrollment.update({
    where: { userId_courseId: { userId, courseId } },
    data: { progress },
  })

  return progress
}
