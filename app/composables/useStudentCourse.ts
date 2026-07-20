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

  async function getReviews(slug: string) {
    return req<any>(`/api/student/courses/${slug}/reviews`)
  }

  async function submitReview(slug: string, payload: { rating: number; comment?: string }) {
    return req<any>(`/api/student/courses/${slug}/reviews`, { method: 'POST', body: payload })
  }

  async function deleteReview(slug: string) {
    return req<any>(`/api/student/courses/${slug}/reviews`, { method: 'DELETE' })
  }

  async function getComments(lessonId: number) {
    return req<any[]>(`/api/student/lessons/${lessonId}/comments`)
  }

  async function postComment(lessonId: number, payload: { content: string; parentId?: number }) {
    return req<any>(`/api/student/lessons/${lessonId}/comments`, { method: 'POST', body: payload })
  }

  async function deleteComment(lessonId: number, commentId: number) {
    return req<{ deleted: boolean }>(`/api/student/lessons/${lessonId}/comments/${commentId}`, { method: 'DELETE' })
  }

  return {
    getEnrollments, getCourse, completeLesson, uncompleteLesson, submitQuiz,
    getReviews, submitReview, deleteReview,
    getComments, postComment, deleteComment,
  }
}
