export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Basic mock authentication
    if (body.email === 'alex@rivera.com' && body.password === 'password') {
        return {
            token: 'mock_jwt_token_for_' + body.email,
            user: {
                email: body.email,
                name: 'Alex Rivera',
                role: 'APPRENANT'
            }
        }
    }

    throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials',
    })
})
