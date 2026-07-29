export default defineNuxtRouteMiddleware(async (to) => {
  const PUBLIC_PATHS = ['/auth', '/', '/catalog', '/courses', '/conferences']
  const isPublicRoute = PUBLIC_PATHS.some(p =>
    p === '/' ? to.path === '/' : to.path.startsWith(p)
  )
  const isAuthPage = to.path.startsWith('/auth')

  const tokenCookie = useCookie('token')
  const authStore = useAuthStore()

  /**
   * Passe SSR : useCookie lit l'en-tête Cookie de la requête, donc le token est
   * visible même s'il est httpOnly. On ne peut pas appeler /api/auth/me ici
   * (auto-appel HTTP Nitro → deadlock dans Docker), on se fie donc à la simple
   * présence du cookie ; le client validera juste après.
   */
  if (import.meta.server) {
    if (!tokenCookie.value) {
      if (isPublicRoute) return
      return navigateTo('/auth/login')
    }
    if (isAuthPage) return navigateTo('/')
    return
  }

  // Déjà validé côté client dans cette session
  if (authStore.user) {
    if (isAuthPage) return navigateTo('/')
    return
  }

  /**
   * Côté client, on ne peut PAS se fier à useCookie('token') : le cookie posé par
   * le login Google est httpOnly, donc invisible en JS. La seule source de vérité
   * est /api/auth/me — le cookie est envoyé automatiquement (same-origin), et le
   * serveur accepte aussi bien le cookie que l'en-tête Authorization.
   */
  try {
    const { user } = await $fetch<{ user: NonNullable<typeof authStore.user> }>('/api/auth/me', {
      headers: tokenCookie.value ? { Authorization: `Bearer ${tokenCookie.value}` } : {},
    })
    authStore.token = tokenCookie.value ?? null
    authStore.user = user
    if (isAuthPage) return navigateTo('/')
  } catch {
    // Non authentifié (pas de session, ou session périmée)
    tokenCookie.value = null
    authStore.token = null
    authStore.user = null
    if (!isPublicRoute) return navigateTo('/auth/login')
  }
})
