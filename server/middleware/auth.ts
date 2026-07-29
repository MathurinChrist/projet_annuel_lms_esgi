const PUBLIC_PREFIXES = [
  '/api/auth/',
  '/api/categories',
  '/api/courses',
  '/api/conferences',
]

const PUBLIC_EXCEPTIONS = [
  '/api/auth/me',
]

/**
 * Récupère le token depuis le header Authorization ou, à défaut, depuis le cookie.
 * Le cookie 'token' est httpOnly (illisible en JS côté client) : il est envoyé
 * automatiquement par le navigateur en same-origin, c'est donc la seule source
 * disponible pour les sessions Google OAuth.
 */
function extractToken(event: any): string | null {
  const authorization = getHeader(event, 'authorization')
  if (authorization?.startsWith('Bearer ')) return authorization.slice(7)
  return getCookie(event, 'token') || null
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api')) return

  const requiresAuth = path.endsWith('/enroll') || path.endsWith('/register')

  const isPublic = !requiresAuth
    && PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))
    && !PUBLIC_EXCEPTIONS.some((exception) => path.startsWith(exception))

  if (isPublic) {
    // Route publique : l'authentification n'est pas requise, mais on décode quand
    // même le token s'il est présent, pour que les endpoints puissent renvoyer des
    // données personnalisées (enrolled, progress…). Un token absent/invalide
    // n'empêche jamais l'accès ici — il est simplement ignoré.
    const publicToken = extractToken(event)
    if (publicToken) {
      try {
        (event.context as any).auth = verifyToken(publicToken)
      } catch {
        // token invalide/expiré sur une route publique → traité comme anonyme
      }
    }
    return
  }

  const token = extractToken(event)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  }

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
