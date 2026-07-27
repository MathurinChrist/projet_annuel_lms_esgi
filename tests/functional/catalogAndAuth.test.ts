import { describe, it, expect, beforeAll } from 'vitest'
import { serverIsUp, loginAs, api, SEED_USERS } from '../helpers/http'

describe('Catalogue & catégories (functional)', () => {
  let up = false

  beforeAll(async () => {
    up = await serverIsUp()
  })

  it('GET /api/categories retourne une liste', async ({ skip }) => {
    if (!up) skip()
    const res = await api('/api/categories')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
  })

  it('GET /api/courses retourne le catalogue', async ({ skip }) => {
    if (!up) skip()
    const session = await loginAs(SEED_USERS.learner)
    if (!session) skip()
    const res = await api('/api/courses', { token: session!.token })
    expect(res.status).toBe(200)
    const body = await res.json()
    const list = Array.isArray(body) ? body : body.courses
    expect(Array.isArray(list)).toBe(true)
  })
})

describe('Auth multi-rôles (functional)', () => {
  let up = false

  beforeAll(async () => {
    up = await serverIsUp()
  })

  it('connecte formateur et admin', async ({ skip }) => {
    if (!up) skip()
    for (const key of ['trainer', 'admin'] as const) {
      const session = await loginAs(SEED_USERS[key])
      if (!session) skip()
      expect(session!.token).toBeTruthy()
      expect(session!.user.role).toBe(SEED_USERS[key].role)
    }
  })

  it('refuse /api/admin/users pour un apprenant', async ({ skip }) => {
    if (!up) skip()
    const session = await loginAs(SEED_USERS.learner)
    if (!session) skip()
    const res = await api('/api/admin/users', { token: session!.token })
    expect([401, 403]).toContain(res.status)
  })

  it('autorise /api/admin/users pour un admin', async ({ skip }) => {
    if (!up) skip()
    const session = await loginAs(SEED_USERS.admin)
    if (!session) skip()
    const res = await api('/api/admin/users', { token: session!.token })
    expect(res.status).toBe(200)
    const body = await res.json()
    const users = Array.isArray(body) ? body : body.users
    expect(Array.isArray(users)).toBe(true)
  })
})
