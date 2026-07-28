export default defineNuxtPlugin(() => {
  const token = useCookie('token')
  if (!token.value) return

  const auth = useAuthStore()
  if (auth.user) return

  // Le JWT ne contient pas firstName/lastName : on se contente de poser le
  // token, la récupération du profil complet est faite par le middleware
  // via /api/auth/me (seule source fiable des données utilisateur).
  auth.token = token.value
})
