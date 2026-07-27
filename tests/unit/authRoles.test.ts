import { describe, it, expect } from 'vitest'
import { Role } from '@prisma/client'
import { ensureRole, ensureAdmin, ensureTrainer, AUTHORIZED_ROLES } from '../../server/utils/auth'

function fakeEvent(auth: any) {
  return { context: { auth } } as any
}

describe('auth roles (unit)', () => {
  it('expose les rôles autorisés', () => {
    expect(AUTHORIZED_ROLES.ADMIN).toContain(Role.ADMINISTRATEUR)
    expect(AUTHORIZED_ROLES.TRAINER).toContain(Role.FORMATEUR)
  })

  it('refuse un utilisateur non authentifié', () => {
    expect(() => ensureRole(fakeEvent(null), AUTHORIZED_ROLES.LEARNER)).toThrow()
  })

  it('refuse un rôle insuffisant', () => {
    expect(() =>
      ensureAdmin(fakeEvent({ userId: 1, role: Role.APPRENANT })),
    ).toThrow()
  })

  it('accepte un formateur pour ensureTrainer', () => {
    expect(() =>
      ensureTrainer(fakeEvent({ userId: 2, role: Role.FORMATEUR })),
    ).not.toThrow()
  })

  it('accepte un admin partout', () => {
    const admin = fakeEvent({ userId: 3, role: Role.ADMINISTRATEUR })
    expect(() => ensureAdmin(admin)).not.toThrow()
    expect(() => ensureTrainer(admin)).not.toThrow()
  })
})
