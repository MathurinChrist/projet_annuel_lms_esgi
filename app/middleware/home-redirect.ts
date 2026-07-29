export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (auth.user?.role === 'ADMINISTRATEUR') return navigateTo('/admin')
  if (auth.user) return navigateTo('/dashboard')
})
