export default defineEventHandler(async (event) => {
    const { userId } = (event.context as any).auth
    const slug = getRouterParam(event, 'slug')!
    const body = await readBody<{ answers: Record<string, number> }>(event)

    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                        include: {
                            questions: {
                                orderBy: { order: 'asc' },
                                include: {
                                    options: {
                                        orderBy: { order: 'asc' },
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

    // compiler toutes les leçons du cours par ailleurs pour pouvoir trouver les vidéos facilement
    const allLessons = course.modules.flatMap((m: any) => m.lessons)
    const quizAnswers = body?.answers || {}

    // Compiler et évaluer toutes les questions
    const evaluatedQuestions = course.modules.flatMap((m: any) =>
        m.lessons.flatMap((l: any) => {
            // Seulement si c'est un quiz
            if (l.type.toLowerCase() !== 'quiz') return []

            return l.questions.map((q: any) => {
                const correctOption = q.options.find((o: any) => o.isCorrect)
                const studentOptionId = quizAnswers[String(q.id)]
                const isCorrect = studentOptionId != null && Number(studentOptionId) === correctOption?.id

                return {
                    questionId: q.id,
                    text: q.text,
                    lessonId: l.id,
                    lessonTitle: l.title,
                    moduleId: l.moduleId,
                    isCorrect,
                    correctOptionId: correctOption?.id,
                    studentOptionId,
                }
            })
        })
    )

    const totalQuestions = evaluatedQuestions.length
    if (totalQuestions === 0) {
        // Si aucun quiz, validation immédiate à 100%
        await prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId: course.id } },
            update: { progress: 100 },
            create: { userId, courseId: course.id, progress: 100 },
        })

        return {
            success: true,
            score: 0,
            total: 0,
            percentage: 100,
            lessonsToReview: [],
        }
    }

    const correctCount = evaluatedQuestions.filter((q: any) => q.isCorrect).length
    const percentage = Math.round((correctCount / totalQuestions) * 100)
    const isPassed = percentage >= 80

    const wrongQuestions = evaluatedQuestions.filter((q: any) => !q.isCorrect)

    // Identifier les leçons vidéos associées aux modules où l'utilisateur a fait des fautes
    const lessonsToReviewMap = new Map<number, { id: number; title: string; order: number; moduleTitle: string }>()

    for (const wq of wrongQuestions) {
        const parentModule = course.modules.find((m: any) => m.id === wq.moduleId)
        if (parentModule) {
            // Trouver les leçons vidéos de ce module
            const videoLessons = parentModule.lessons.filter((l: any) => l.type.toLowerCase() === 'video')
            if (videoLessons.length > 0) {
                for (const vl of videoLessons) {
                    lessonsToReviewMap.set(vl.id, {
                        id: vl.id,
                        title: vl.title,
                        order: vl.order,
                        moduleTitle: parentModule.title,
                    })
                }
            } else {
                // S'il n'y a pas de vidéos dans ce module, suggérer les leçons vidéos globales du cours
                const globalVideos = allLessons.filter((l: any) => l.type.toLowerCase() === 'video')
                for (const gv of globalVideos) {
                    const mod = course.modules.find((m: any) => m.id === gv.moduleId)
                    lessonsToReviewMap.set(gv.id, {
                        id: gv.id,
                        title: gv.title,
                        order: gv.order,
                        moduleTitle: mod?.title ?? 'Général',
                    })
                }
            }
        }
    }

    const lessonsToReview = Array.from(lessonsToReviewMap.values())

    if (isPassed) {
        // Si validé, on passe la progression à 100%
        await prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId: course.id } },
            update: { progress: 100 },
            create: { userId, courseId: course.id, progress: 100 },
        })
    }

    return {
        success: isPassed,
        score: correctCount,
        total: totalQuestions,
        percentage,
        lessonsToReview,
    }
})
