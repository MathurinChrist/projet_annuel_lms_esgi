export const useStudentCourse = () => {
  const token = useCookie('token')

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  function req<T = unknown>(url: string, opts: Parameters<typeof $fetch>[1] = {}) {
    return $fetch<T>(url, { ...opts, headers: { ...authHeaders(), ...(opts.headers as Record<string, string> || {}) } })
  }

  async function getEnrollments() {
    return req<any[]>('/api/student/courses')
  }

  async function getCourse(slug: string) {
    return req<any>(`/api/student/courses/${slug}`)
  }

  async function completeLesson(id: number) {
    return req<{ completed: boolean; progress: number }>(`/api/student/lessons/${id}/complete`, { method: 'POST' })
  }

  async function uncompleteLesson(id: number) {
    return req<{ completed: boolean; progress: number }>(`/api/student/lessons/${id}/complete`, { method: 'DELETE' })
  }

  async function submitQuiz(id: number, answers: Record<number, number>) {
    return req<any>(`/api/student/lessons/${id}/quiz-submit`, { method: 'POST', body: { answers } })
  }

  return { getEnrollments, getCourse, completeLesson, uncompleteLesson, submitQuiz }
}
