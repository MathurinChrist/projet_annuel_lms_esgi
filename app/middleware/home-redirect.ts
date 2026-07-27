export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (auth.user?.role === 'ADMINISTRATEUR') {
    return navigateTo('/admin')
  }
})
