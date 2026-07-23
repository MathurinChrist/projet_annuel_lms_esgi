export const useCourses = () => {
  const token = useCookie('token')

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  function req<T = unknown>(url: string, opts: Parameters<typeof $fetch>[1] = {}) {
    return $fetch<T>(url, { ...opts, headers: { ...authHeaders(), ...(opts.headers as Record<string, string> || {}) } })
  }

  async function getCatalog(params: Record<string, unknown> = {}) {
    return req<{ courses: any[]; total: number; page: number; limit: number }>('/api/courses', { query: params })
  }

  async function getCategories() {
    return req<any[]>('/api/categories')
  }

  return { getCatalog, getCategories }
}
