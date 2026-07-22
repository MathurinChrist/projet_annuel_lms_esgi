export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

    const { userId } = (event.context as any).auth

    // Récupérer tous les cours publiés
    const courses = await prisma.course.findMany({
        where: {
            status: 'PUBLISHED',
            published: true,
        },
        orderBy: { updatedAt: 'desc' },
        include: {
            category: true,
            author: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            },
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            duration: true,
                        },
                    },
                },
            },
            reviews: {
                select: {
                    rating: true,
                },
            },
            enrollments: {
                where: { userId },
                select: { id: true, progress: true },
            },
        },
    })

    return courses.map((c: any) => {
        const totalReviews = c.reviews.length
        const avgRating = totalReviews > 0
            ? c.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
            : 0

        return {
            id: c.id,
            title: c.title,
            slug: c.slug,
            description: c.description,
            coverImage: c.coverImage,
            difficulty: c.difficulty,
            tags: c.tags,
            category: c.category,
            author: c.author,
            modules: c.modules.map((m: any) => ({
                id: m.id,
                title: m.title,
                order: m.order,
                lessons: m.lessons,
            })),
            lessonCount: c.modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0),
            isEnrolled: c.enrollments.length > 0,
            progress: c.enrollments[0]?.progress ?? 0,
            rating: {
                average: avgRating,
                count: totalReviews,
            },
        }
    })
})

