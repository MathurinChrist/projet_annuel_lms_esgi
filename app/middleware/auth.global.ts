export default defineNuxtRouteMiddleware(async (to) => {
  const PUBLIC_PATHS = ['/auth', '/', '/catalog', '/courses', '/conferences']
  const isPublicRoute = PUBLIC_PATHS.some(p =>
    p === '/' ? to.path === '/' : to.path.startsWith(p)
  )
  const isAuthPage = to.path.startsWith('/auth')

  const tokenCookie = useCookie('token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  const authStore = useAuthStore()

  /**
   * Passe SSR : useCookie lit l'en-tête Cookie de la requête.
   */
  if (import.meta.server) {
    if (!tokenCookie.value) {
      if (isPublicRoute) return
      return navigateTo('/auth/login')
    }
    if (isAuthPage) return navigateTo('/')
    return
  }

  if (authStore.user) {
    if (isAuthPage) return navigateTo('/')
    return
  }

  try {
    const headers: Record<string, string> = {}
    if (tokenCookie.value && tokenCookie.value.split('.').length === 3) {
      headers.Authorization = `Bearer ${tokenCookie.value}`
    }
    const { user } = await $fetch<{ user: NonNullable<typeof authStore.user> }>('/api/auth/me', {
      credentials: 'include',
      headers,
    })
    authStore.token = tokenCookie.value ?? 'cookie'
    authStore.user = user
    if (isAuthPage) return navigateTo('/')
  } catch {
    authStore.token = null
    authStore.user = null
    if (!isPublicRoute) return navigateTo('/auth/login')
  }
})
