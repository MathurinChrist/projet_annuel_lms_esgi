export default defineNuxtRouteMiddleware(async (to) => {
  const isPublicRoute = to.path.startsWith('/auth')

  const tokenCookie = useCookie('token')
  const cookieToken = tokenCookie.value

  const authStore = useAuthStore()

  // Route publique + cookie présent → user déjà connecté, rediriger vers /
  if (isPublicRoute && cookieToken) {
    return navigateTo('/')
  }

  // Route publique + pas de cookie → laisser passer
  if (isPublicRoute) {
    return
  }

  // Route protégée + pas de cookie → rediriger vers login
  if (!cookieToken) {
    return navigateTo('/auth/login')
  }

  // Route protégée + cookie présent + store déjà hydraté → laisser passer
  if (authStore.user) {
    return
  }

  // Route protégée + cookie présent + store non hydraté → appel /api/auth/me
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
