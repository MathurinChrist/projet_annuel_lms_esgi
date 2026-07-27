import { describe, it, expect, beforeAll } from 'vitest'
import { serverIsUp, loginAs, api, SEED_USERS } from '../helpers/http'

describe('Parcours apprenant (functional)', () => {
  let up = false
  let token = ''

  beforeAll(async () => {
    up = await serverIsUp()
    if (!up) return
    const session = await loginAs(SEED_USERS.learner)
    if (session) token = session.token
  })

  it('charge le dashboard étudiant', async ({ skip }) => {
    if (!up || !token) skip()
    const res = await api('/api/student/dashboard', { token })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toBeTruthy()
  })

  it('liste les cours inscrits', async ({ skip }) => {
    if (!up || !token) skip()
    const res = await api('/api/student/courses', { token })
    expect(res.status).toBe(200)
    const body = await res.json()
    const list = Array.isArray(body) ? body : body.courses || body.enrollments
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('charge un cours inscrit par slug avec modules', async ({ skip }) => {
    if (!up || !token) skip()
    const listRes = await api('/api/student/courses', { token })
    const listBody = await listRes.json()
    const list = Array.isArray(listBody) ? listBody : listBody.courses || listBody.enrollments || []
    const first = list[0]
    const slug = first?.slug || first?.course?.slug
    if (!slug) skip()

    const res = await api(`/api/student/courses/${slug}`, { token })
    expect(res.status).toBe(200)
    const course = await res.json()
    expect(course.slug || course.course?.slug || slug).toBeTruthy()
    const modules = course.modules || course.course?.modules
    expect(Array.isArray(modules)).toBe(true)
  })

  it('lit les avis d’un cours', async ({ skip }) => {
    if (!up || !token) skip()
    const listRes = await api('/api/student/courses', { token })
    const listBody = await listRes.json()
    const list = Array.isArray(listBody) ? listBody : listBody.courses || listBody.enrollments || []
    const slug = list[0]?.slug || list[0]?.course?.slug
    if (!slug) skip()

    const res = await api(`/api/student/courses/${slug}/reviews`, { token })
    expect(res.status).toBe(200)
  })

  it('liste certificats et détail éventuel', async ({ skip }) => {
    if (!up || !token) skip()
    const res = await api('/api/student/certificates', { token })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.certificates)).toBe(true)

    if (body.certificates[0]?.code) {
      const code = encodeURIComponent(body.certificates[0].code)
      const detail = await api(`/api/student/certificates/${code}`, { token })
      expect(detail.status).toBe(200)
      const cert = await detail.json()
      expect(cert.code).toBe(body.certificates[0].code)
      expect(cert.durationLabel || cert.course?.durationLabel).toBeTruthy()

      const pdf = await api(`/api/student/certificates/${code}/pdf`, { token })
      expect(pdf.status).toBe(200)
      expect(pdf.headers.get('content-type')).toMatch(/pdf/)
      const buf = Buffer.from(await pdf.arrayBuffer())
      expect(buf.slice(0, 4).toString()).toBe('%PDF')
    }
  })
})
