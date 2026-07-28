const PUBLIC_PREFIXES = [
  '/api/auth/',
  '/api/categories',
  '/api/courses',
  '/api/conferences',
]

const PUBLIC_EXCEPTIONS = [
  '/api/auth/me',
]

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api')) return

  const requiresAuth = path.endsWith('/enroll') || path.endsWith('/register')

  const isPublic = !requiresAuth
    && PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))
    && !PUBLIC_EXCEPTIONS.some((exception) => path.startsWith(exception))

  if (isPublic) return

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

  if (path.startsWith('/api/instructor/')) {
    const role = (event.context as any).auth?.role
    if (role !== 'FORMATEUR' && role !== 'ADMINISTRATEUR') {
      throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux formateurs' })
    }
  }
})
