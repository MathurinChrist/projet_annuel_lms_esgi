import { describe, it, expect } from 'vitest'
import { checkRateLimit } from '../../server/utils/rateLimit'

describe('rateLimit (unit)', () => {
  it('autorise les premières tentatives', () => {
    const key = `unit-rl-${Date.now()}-a`
    const r1 = checkRateLimit(key, { windowMs: 60_000, maxAttempts: 3 })
    const r2 = checkRateLimit(key, { windowMs: 60_000, maxAttempts: 3 })
    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
  })

  it('bloque au-delà de maxAttempts', () => {
    const key = `unit-rl-${Date.now()}-b`
    checkRateLimit(key, { windowMs: 60_000, maxAttempts: 2 })
    checkRateLimit(key, { windowMs: 60_000, maxAttempts: 2 })
    const blocked = checkRateLimit(key, { windowMs: 60_000, maxAttempts: 2 })
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBeGreaterThan(0)
  })
})
