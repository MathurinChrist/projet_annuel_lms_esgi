export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

    const { userId } = (event.context as any).auth
    const slug = getRouterParam(event, 'slug')!

    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            modules: {
                include: {
                    lessons: {
                        where: {
                            type: {
                                equals: 'quiz',
                                mode: 'insensitive',
                            },
                        },
                        include: {
                            questions: {
                                orderBy: { order: 'asc' },
                                include: {
                                    options: {
                                        orderBy: { order: 'asc' },
                                        select: { id: true, text: true, order: true },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    if (!course) {
        throw createError({ statusCode: 404, statusMessage: 'Cours introuvable' })
    }

    // Compiler toutes les questions de toutes les leçons de type quiz du cours
    const questions = course.modules.flatMap((m: any) =>
        m.lessons.flatMap((l: any) =>
            l.questions.map((q: any) => ({
                ...q,
                lessonId: l.id,
                lessonTitle: l.title,
            }))
        )
    )

    return {
        questions,
    }
})
