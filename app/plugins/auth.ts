export default defineNuxtPlugin(() => {
  const token = useCookie('token')
  if (!token.value) return

  const auth = useAuthStore()
  if (auth.user) return

  try {
    const parts = token.value.split('.')
    if (parts.length >= 2) {
      const payload = JSON.parse(atob(parts[1]))
      auth.token = token.value
      auth.user = {
        id: String(payload.id || payload.sub || ''),
        email: payload.email || '',
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
      }
    }
  } catch {
    // token invalide ou malformé
  }
})
