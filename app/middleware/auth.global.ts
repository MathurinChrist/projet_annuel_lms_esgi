export default defineNuxtRouteMiddleware(async (to) => {
  const isPublicRoute = to.path.startsWith('/auth')

  const tokenCookie = useCookie('token')
  const cookieToken = tokenCookie.value

  const authStore = useAuthStore()

  if (cookieToken && !authStore.token) {
    authStore.token = cookieToken
  }

  // Route publique + cookie présent → déjà connecté (validation côté client)
  if (isPublicRoute && cookieToken) {
    return navigateTo('/')
  }

  // Route publique + pas de cookie → laisser passer
  if (isPublicRoute) {
    return
  }

  // Route protégée + pas de cookie → login
  if (!cookieToken) {
    return navigateTo('/auth/login')
  }

  // Store déjà hydraté
  if (authStore.user) {
    return
  }

  /**
   * Important: ne PAS appeler $fetch('/api/auth/me') pendant le SSR.
   * Dans Docker / Nitro, cet auto-appel HTTP bloque la requête (deadlock) → page qui charge à l'infini.
   * On hydrate le user uniquement côté client.
   */
  if (import.meta.server) {
    return
  }

  try {
    const { user } = await $fetch<{ user: NonNullable<typeof authStore.user> }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${cookieToken}` },
    })
    authStore.token = cookieToken
    authStore.user = user
  } catch {
    tokenCookie.value = null
    authStore.token = null
    authStore.user = null
    return navigateTo('/auth/login')
  }
})
