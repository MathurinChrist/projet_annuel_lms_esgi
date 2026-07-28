export default defineNuxtRouteMiddleware(async (to) => {
  const PUBLIC_PATHS = ['/auth', '/', '/catalog', '/courses', '/conferences']
  const isPublicRoute = PUBLIC_PATHS.some(p =>
    p === '/' ? to.path === '/' : to.path.startsWith(p)
  )
  const isAuthPage = to.path.startsWith('/auth')

  const tokenCookie = useCookie('token')
  const cookieToken = tokenCookie.value

  const authStore = useAuthStore()

  if (cookieToken && !authStore.token) {
    authStore.token = cookieToken
  }

  // Pas de cookie → route protégée : direction login, route publique : laisser passer
  if (!cookieToken) {
    if (isPublicRoute) return
    return navigateTo('/auth/login')
  }

  /**
   * Important: ne PAS appeler $fetch('/api/auth/me') pendant le SSR.
   * Dans Docker / Nitro, cet auto-appel HTTP bloque la requête (deadlock) → page qui charge à l'infini.
   * Le cookie n'étant pas validable ici, on se fie à sa simple présence pour cette passe ;
   * le client validera juste après et corrigera si besoin (cookie périmé, etc.).
   */
  if (import.meta.server) {
    if (isAuthPage) return navigateTo('/')
    return
  }

  // Déjà validé côté client dans cette session
  if (authStore.user) {
    if (isAuthPage) return navigateTo('/')
    return
  }

  try {
    const { user } = await $fetch<{ user: NonNullable<typeof authStore.user> }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${cookieToken}` },
    })
    authStore.token = cookieToken
    authStore.user = user
    if (isAuthPage) return navigateTo('/')
  } catch {
    // Cookie invalide/périmé : on le nettoie sans reboucler sur une route publique
    tokenCookie.value = null
    authStore.token = null
    authStore.user = null
    if (!isPublicRoute) return navigateTo('/auth/login')
  }
})
