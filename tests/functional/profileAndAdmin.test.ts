import { describe, it, expect, beforeAll } from 'vitest'
import { serverIsUp, loginAs, api, SEED_USERS } from '../helpers/http'

describe('Profil & sécurité (functional)', () => {
  let up = false
  let token = ''

  beforeAll(async () => {
    up = await serverIsUp()
    if (!up) return
    const session = await loginAs(SEED_USERS.learner)
    if (session) token = session.token
  })

  it('met à jour le prénom puis le restaure', async ({ skip }) => {
    if (!up || !token) skip()

    const beforeRes = await api('/api/users/profile', { token })
    expect(beforeRes.status).toBe(200)
    const before = await beforeRes.json()
    const original = before.user.firstName

    const putRes = await api('/api/users/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify({ firstName: `${original}-T` }),
    })
    expect(putRes.status).toBe(200)
    const updated = await putRes.json()
    expect(updated.user.firstName).toBe(`${original}-T`)

    const restore = await api('/api/users/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify({ firstName: original }),
    })
    expect(restore.status).toBe(200)
  })

  it('bascule loginAlerts', async ({ skip }) => {
    if (!up || !token) skip()
    const beforeRes = await api('/api/users/profile', { token })
    const before = await beforeRes.json()
    const next = !before.user.loginAlerts

    const putRes = await api('/api/users/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify({ loginAlerts: next }),
    })
    expect(putRes.status).toBe(200)
    const updated = await putRes.json()
    expect(updated.user.loginAlerts).toBe(next)

    await api('/api/users/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify({ loginAlerts: before.user.loginAlerts }),
    })
  })
})

describe('Admin users (functional)', () => {
  let up = false

  beforeAll(async () => {
    up = await serverIsUp()
  })

  it('peut lister puis re-activer un utilisateur', async ({ skip }) => {
    if (!up) skip()
    const session = await loginAs(SEED_USERS.admin)
    if (!session) skip()

    const listRes = await api('/api/admin/users', { token: session!.token })
    expect(listRes.status).toBe(200)
    const body = await listRes.json()
    const users = Array.isArray(body) ? body : body.users
    const target = users.find((u: any) => u.email === SEED_USERS.learner.email)
    expect(target).toBeTruthy()

    // Ensure active (idempotent)
    const patch = await api(`/api/admin/users/${target.id}/status`, {
      method: 'PATCH',
      token: session!.token,
      body: JSON.stringify({ active: true }),
    })
    expect([200, 204]).toContain(patch.status)
  })
})
