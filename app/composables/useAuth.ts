export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const logout = async () => {
    await authStore.logout()
    router.push('/auth/login')
  }

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)

  return { user, isAuthenticated, logout }
}
