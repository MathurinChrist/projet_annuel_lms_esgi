import { describe, it, expect, beforeAll } from 'vitest'
import { loadEnvFile } from '../helpers/env'

loadEnvFile()

describe('password + jwt (integration)', () => {
  beforeAll(() => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      process.env.JWT_SECRET = 'test-secret-key-for-integration-32c'
    }
  })

  it('hash et compare un mot de passe correctement', async () => {
    const { hashPassword, comparePassword } = await import('../../server/utils/password')
    const hash = await hashPassword('apprenant123')
    expect(hash).not.toBe('apprenant123')
    expect(await comparePassword('apprenant123', hash)).toBe(true)
    expect(await comparePassword('wrong-password', hash)).toBe(false)
  })

  it('génère et vérifie un JWT valide', async () => {
    const { generateToken, verifyToken } = await import('../../server/utils/jwt')
    const token = generateToken({
      userId: 42,
      email: 'marie.apprenant@edupulse.com',
      role: 'APPRENANT',
    })
    const payload = verifyToken(token)
    expect(payload.userId).toBe(42)
    expect(payload.email).toBe('marie.apprenant@edupulse.com')
    expect(payload.role).toBe('APPRENANT')
  })

  it('rejette un JWT invalide', async () => {
    const { verifyToken } = await import('../../server/utils/jwt')
    expect(() => verifyToken('not.a.valid.token')).toThrow()
  })
})
