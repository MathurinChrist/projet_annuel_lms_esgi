import { describe, it, expect, beforeAll } from 'vitest'
import { serverIsUp, loginAs, api, SEED_USERS } from '../helpers/http'

describe('Espace formateur (functional)', () => {
  let up = false
  let token = ''

  beforeAll(async () => {
    up = await serverIsUp()
    if (!up) return
    const session = await loginAs(SEED_USERS.trainer)
    if (session) token = session.token
  })

  it('liste les cours du formateur', async ({ skip }) => {
    if (!up || !token) skip()
    const res = await api('/api/instructor/courses', { token })
    expect(res.status).toBe(200)
    const body = await res.json()
    const list = Array.isArray(body) ? body : body.courses
    expect(Array.isArray(list)).toBe(true)
  })

  it('crée un cours brouillon puis le récupère', async ({ skip }) => {
    if (!up || !token) skip()
    const title = `Vitest Course ${Date.now()}`
    const createRes = await api('/api/instructor/courses', {
      method: 'POST',
      token,
      body: JSON.stringify({
        title,
        description: 'Cours créé par les tests fonctionnels',
        difficulty: 'BEGINNER',
      }),
    })
    expect([200, 201]).toContain(createRes.status)
    const created = await createRes.json()
    const id = created.id || created.course?.id
    expect(id).toBeTruthy()

    const getRes = await api(`/api/instructor/courses/${id}`, { token })
    expect(getRes.status).toBe(200)
    const course = await getRes.json()
    expect(course.title || course.course?.title).toContain('Vitest Course')
  })

  it('liste les conférences formateur', async ({ skip }) => {
    if (!up || !token) skip()
    const res = await api('/api/instructor/conferences', { token })
    expect(res.status).toBe(200)
  })
})

describe('Messages (functional)', () => {
  let up = false
  let token = ''

  beforeAll(async () => {
    up = await serverIsUp()
    if (!up) return
    const session = await loginAs(SEED_USERS.learner)
    if (session) token = session.token
  })

  it('lit les conversations et le compteur unread', async ({ skip }) => {
    if (!up || !token) skip()
    const inbox = await api('/api/messages', { token })
    expect(inbox.status).toBe(200)

    const unread = await api('/api/messages/unread', { token })
    expect(unread.status).toBe(200)
    const body = await unread.json()
    expect(typeof body.count).toBe('number')
  })

  it('recherche des utilisateurs', async ({ skip }) => {
    if (!up || !token) skip()
    const res = await api('/api/users/search?q=jean', { token })
    expect(res.status).toBe(200)
    const body = await res.json()
    const users = Array.isArray(body) ? body : body.users
    expect(Array.isArray(users)).toBe(true)
  })
})

describe('Conférences publiques (functional)', () => {
  let up = false

  beforeAll(async () => {
    up = await serverIsUp()
  })

  it('liste les conférences', async ({ skip }) => {
    if (!up) skip()
    const session = await loginAs(SEED_USERS.learner)
    if (!session) skip()
    const res = await api('/api/conferences', { token: session!.token })
    expect(res.status).toBe(200)
  })
})
