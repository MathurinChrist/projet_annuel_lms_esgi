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

  if (!path.startsWith('/api') || PUBLIC_ROUTES.some(route => path === route)) {
    return
  }

  const authorization = getHeader(event, 'authorization')

  if (!authorization) {
    throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  }

  if (!authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Format de token invalide (Bearer requis)' })
  }

  const token = authorization.slice(7)

  try {
    (event.context as any).auth = verifyToken(token)

  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw createError({ statusCode: 401, statusMessage: 'Session expirée, veuillez vous reconnecter' })
    }
    throw createError({ statusCode: 401, statusMessage: 'Token invalide' })
  }
})
