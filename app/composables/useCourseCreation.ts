export const useCourseCreation = () => {
  const token = useCookie('token')

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  function req<T = unknown>(url: string, opts: Parameters<typeof $fetch>[1] = {}) {
    return $fetch<T>(url, { ...opts, headers: { ...authHeaders(), ...(opts.headers as Record<string, string> || {}) } })
  }

  async function getCourses() {
    return req<any[]>('/api/instructor/courses')
  }

  async function getCourse(slug: string) {
    return req<any>(`/api/instructor/courses/${slug}`)
  }

  async function createCourse(data: Record<string, unknown>) {
    return req<{ id: number; slug: string }>('/api/instructor/courses', { method: 'POST', body: data })
  }

  async function updateCourse(id: number, data: Record<string, unknown>) {
    return req(`/api/instructor/courses/${id}`, { method: 'PUT', body: data })
  }

  async function addModule(courseId: number, title: string) {
    return req<{ id: number; title: string; order: number; lessons: unknown[] }>(
      `/api/instructor/courses/${courseId}/modules`,
      { method: 'POST', body: { title } },
    )
  }

  async function updateModule(id: number, data: Record<string, unknown>) {
    return req(`/api/instructor/modules/${id}`, { method: 'PUT', body: data })
  }

  async function deleteModule(id: number) {
    return req(`/api/instructor/modules/${id}`, { method: 'DELETE' })
  }

  async function addLesson(moduleId: number, data: Record<string, unknown>) {
    return req<{ id: number; title: string; type: string; duration: string | null }>(
      `/api/instructor/modules/${moduleId}/lessons`,
      { method: 'POST', body: data },
    )
  }

  async function updateLesson(id: number, data: Record<string, unknown>) {
    return req(`/api/instructor/lessons/${id}`, { method: 'PUT', body: data })
  }

  async function deleteLesson(id: number) {
    return req(`/api/instructor/lessons/${id}`, { method: 'DELETE' })
  }

  async function saveSettings(id: number, data: { isPublic: boolean; hasCertificate: boolean }) {
    return req(`/api/instructor/courses/${id}`, { method: 'PUT', body: data })
  }

  async function publishCourse(id: number, data: { isPublic: boolean; hasCertificate: boolean }) {
    return req(`/api/instructor/courses/${id}/publish`, { method: 'POST', body: data })
  }

  async function deleteCourse(id: number) {
    return req(`/api/instructor/courses/${id}`, { method: 'DELETE' })
  }

  async function uploadFile(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    return req<{ url: string }>('/api/upload', { method: 'POST', body: fd })
  }

  async function getReviews(courseIdOrSlug: number | string) {
    return req<{ average: number; count: number; reviews: any[] }>(`/api/instructor/courses/${courseIdOrSlug}/reviews`)
  }

  async function getQa(courseIdOrSlug: number | string) {
    return req<{ lessons: any[]; questionCount: number }>(`/api/instructor/courses/${courseIdOrSlug}/qa`)
  }

  async function postReply(lessonId: number, data: { content: string; parentId?: number }) {
    return req(`/api/instructor/lessons/${lessonId}/comments`, { method: 'POST', body: data })
  }

  async function deleteComment(lessonId: number, commentId: number) {
    return req(`/api/instructor/lessons/${lessonId}/comments/${commentId}`, { method: 'DELETE' })
  }

  async function generateQuizFromYoutube(data: {
    url: string
    transcript?: string
    questionCount?: number
    courseTitle?: string
    lessonTitle?: string
  }) {
    return req<{
      videoId: string
      transcriptLength: number
      source?: string
      quizTitle: string
      questions: Array<{
        text: string
        options: Array<{ text: string; isCorrect: boolean }>
      }>
    }>('/api/instructor/ai/generate-quiz-from-youtube', {
      method: 'POST',
      body: data,
    })
  }

  async function generateFinalQuiz(courseId: number, questionCount = 8) {
    return req<{
      title: string
      questionCount: number
      questions: any[]
      videoEnrichment?: {
        attempted: number
        withContent: number
        sources: Array<{ lessonId: number; source: string | null }>
      }
    }>(
      `/api/instructor/courses/${courseId}/generate-final-quiz`,
      { method: 'POST', body: { questionCount } },
    )
  }

  return {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    saveSettings,
    publishCourse,
    uploadFile,
    getReviews,
    getQa,
    postReply,
    deleteComment,
    generateQuizFromYoutube,
    generateFinalQuiz,
  }
}
