export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validate body
    if (!body.email || !body.password || !body.name) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields',
        })
    }

    // In a real app, you would hash password and save to DB
    // For now, let's return a success message
    return {
        message: 'User registered successfully',
        user: {
            email: body.email,
            name: body.name,
            role: body.role || 'APPRENANT'
        }
    }
})
