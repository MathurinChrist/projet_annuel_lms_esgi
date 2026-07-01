export const useCourseCreation = () => {
  async function createCourse(data: Record<string, unknown>) {
    return $fetch<{ id: number; slug: string }>('/api/instructor/courses', { method: 'POST', body: data })
  }

  async function updateCourse(id: number, data: Record<string, unknown>) {
    return $fetch(`/api/instructor/courses/${id}`, { method: 'PUT', body: data })
  }

  async function addModule(courseId: number, title: string) {
    return $fetch<{ id: number; title: string; order: number; lessons: unknown[] }>(
      `/api/instructor/courses/${courseId}/modules`,
      { method: 'POST', body: { title } },
    )
  }

  async function updateModule(id: number, data: Record<string, unknown>) {
    return $fetch(`/api/instructor/modules/${id}`, { method: 'PUT', body: data })
  }

  async function deleteModule(id: number) {
    return $fetch(`/api/instructor/modules/${id}`, { method: 'DELETE' })
  }

  async function addLesson(moduleId: number, data: Record<string, unknown>) {
    return $fetch<{ id: number; title: string; type: string; duration: string | null }>(
      `/api/instructor/modules/${moduleId}/lessons`,
      { method: 'POST', body: data },
    )
  }

  async function updateLesson(id: number, data: Record<string, unknown>) {
    return $fetch(`/api/instructor/lessons/${id}`, { method: 'PUT', body: data })
  }

  async function deleteLesson(id: number) {
    return $fetch(`/api/instructor/lessons/${id}`, { method: 'DELETE' })
  }

  async function saveSettings(id: number, data: { isPublic: boolean; hasCertificate: boolean }) {
    return $fetch(`/api/instructor/courses/${id}`, { method: 'PUT', body: data })
  }

  async function publishCourse(id: number, data: { isPublic: boolean; hasCertificate: boolean }) {
    return $fetch(`/api/instructor/courses/${id}/publish`, { method: 'POST', body: data })
  }

  async function deleteCourse(id: number) {
    return $fetch(`/api/instructor/courses/${id}`, { method: 'DELETE' })
  }

  return { createCourse, updateCourse, deleteCourse, addModule, updateModule, deleteModule, addLesson, updateLesson, deleteLesson, saveSettings, publishCourse }
}
