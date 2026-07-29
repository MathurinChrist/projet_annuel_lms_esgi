export const useNotes = () => {
  const token = useCookie('token')

  function authHeaders(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  function req<T = unknown>(url: string, opts: Parameters<typeof $fetch>[1] = {}) {
    return $fetch<T>(url, { ...opts, headers: { ...authHeaders(), ...(opts.headers as Record<string, string> || {}) } })
  }

  async function listNotes(filters: {
    courseId?: number
    lessonId?: number
    tag?: string
    unattached?: boolean
    dateFrom?: string
    dateTo?: string
    search?: string
    page?: number
    limit?: number
    sort?: 'recent' | 'oldest'
  } = {}) {
    return req<{ notes: any[]; total: number; page: number; limit: number }>('/api/student/notes', { query: filters })
  }

  async function getNote(id: number) {
    return req<any>(`/api/student/notes/${id}`)
  }

  async function createNote(payload: { title?: string; content?: string; tags?: string[]; courseId?: number; lessonId?: number }) {
    return req<any>('/api/student/notes', { method: 'POST', body: payload })
  }

  async function updateNote(id: number, payload: { title?: string; content?: string; tags?: string[]; courseId?: number | null; lessonId?: number | null }) {
    return req<any>(`/api/student/notes/${id}`, { method: 'PATCH', body: payload })
  }

  async function deleteNote(id: number) {
    return req<{ deleted: boolean }>(`/api/student/notes/${id}`, { method: 'DELETE' })
  }

  return { listNotes, getNote, createNote, updateNote, deleteNote }
}
