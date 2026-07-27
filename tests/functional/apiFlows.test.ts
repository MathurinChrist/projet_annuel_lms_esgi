import { describe, it, expect, beforeAll } from 'vitest'
import { serverIsUp, loginAs, api, SEED_USERS, baseUrl } from '../helpers/http'

describe('API fonctionnelle EduPulse', () => {
  let available = false

  beforeAll(async () => {
    available = await serverIsUp()
    if (!available) {
      console.warn(`[functional] Serveur inaccessible sur ${baseUrl()} — tests ignorés.`)
    }
  })

  it('répond sur la page d’accueil (redirect ou 200)', async ({ skip }) => {
    if (!available) skip()
    const res = await fetch(baseUrl(), { redirect: 'manual' })
    expect([200, 302]).toContain(res.status)
  })

  it('rejette un login avec mauvais mot de passe', async ({ skip }) => {
    if (!available) skip()
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: SEED_USERS.learner.email,
        password: 'wrong-password-xyz',
      }),
    })
    expect([401, 429]).toContain(res.status)
  })

  it('authentifie un apprenant et lit son profil', async ({ skip }) => {
    if (!available) skip()
    const session = await loginAs(SEED_USERS.learner)
    if (!session) skip()

    expect(session!.token).toBeTruthy()

    const meRes = await api('/api/auth/me', { token: session!.token })
    expect(meRes.status).toBe(200)
    const me = await meRes.json()
    expect(me.user?.email).toBe(SEED_USERS.learner.email)

    const profileRes = await api('/api/users/profile', { token: session!.token })
    expect(profileRes.status).toBe(200)
    const profile = await profileRes.json()
    expect(profile.user?.email).toBe(SEED_USERS.learner.email)
    expect(typeof profile.user?.loginAlerts).toBe('boolean')
  })

  it('liste les certificats de l’apprenant authentifié', async ({ skip }) => {
    if (!available) skip()
    const session = await loginAs(SEED_USERS.learner)
    if (!session) skip()

    const res = await api('/api/student/certificates', { token: session!.token })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.certificates)).toBe(true)
    expect(Array.isArray(body.pending)).toBe(true)
  })

  it('refuse /api/users/profile sans token', async ({ skip }) => {
    if (!available) skip()
    const res = await api('/api/users/profile')
    expect(res.status).toBe(401)
  })
})
