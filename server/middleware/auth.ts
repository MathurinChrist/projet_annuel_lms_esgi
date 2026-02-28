const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/google',
  '/api/auth/google/callback',
]

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  // Ignorer les routes non-API et les routes auth publiques
  if (!path.startsWith('/api') || PUBLIC_ROUTES.includes(path)) {
    return
  }

  const authorization = getHeader(event, 'authorization')

  if (!authorization?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Token manquant' })
  }

  const token = authorization.slice(7)

  try {
    const payload = verifyToken(token)
    event.context.auth = payload
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Token invalide' })
  }
})
