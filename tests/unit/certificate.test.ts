import { describe, it, expect } from 'vitest'
import { parseDurationMinutes, formatDuration } from '../../app/utils/duration'
import {
  parseDurationMinutes as parseCertDuration,
  formatDurationLabel,
  sumCourseDurationMinutes,
  resolveCertificateLevel,
  generateCertificateCode,
  difficultyBaseLevel,
} from '../../server/utils/certificate'

describe('duration helpers (unit)', () => {
  it('parse les durées "X min"', () => {
    expect(parseDurationMinutes('10 min')).toBe(10)
    expect(parseDurationMinutes('25 min')).toBe(25)
    expect(parseDurationMinutes('-')).toBe(0)
    expect(parseDurationMinutes(null)).toBe(0)
  })

  it('formate une durée totale', () => {
    expect(formatDuration(0)).toBe('-')
    expect(formatDuration(45)).toBe('45min')
    expect(formatDuration(90)).toBe('1h 30min')
  })
})

describe('certificate duration & levels (unit)', () => {
  it('parse aussi les formats avec heures', () => {
    expect(parseCertDuration('2 h')).toBe(120)
    expect(parseCertDuration('15 min')).toBe(15)
  })

  it('formate le label de durée certificat', () => {
    expect(formatDurationLabel(0)).toBe('—')
    expect(formatDurationLabel(20)).toBe('20 min')
    expect(formatDurationLabel(90)).toBe('1 h 30 min')
    expect(formatDurationLabel(60)).toBe('1 h')
  })

  it('somme les durées des leçons par modules', () => {
    const minutes = sumCourseDurationMinutes([
      { lessons: [{ duration: '10 min' }, { duration: '10 min' }] },
      { lessons: [{ duration: '30 min' }] },
    ])
    expect(minutes).toBe(50)
    expect(formatDurationLabel(minutes)).toBe('50 min')
  })

  it('déduit le niveau de base depuis la difficulté', () => {
    expect(difficultyBaseLevel('BEGINNER').level).toBe('INITIATION')
    expect(difficultyBaseLevel('INTERMEDIATE').level).toBe('INTERMEDIAIRE')
    expect(difficultyBaseLevel('ADVANCED').label).toBe('Niveau Avancé')
  })

  it('attribue une mention selon le score', () => {
    expect(resolveCertificateLevel('BEGINNER', 88).mention).toBe('Mention Très Bien')
    expect(resolveCertificateLevel('BEGINNER', 96).mention).toBe('Mention Excellent')
    expect(resolveCertificateLevel('BEGINNER', 96).level).toBe('INTERMEDIAIRE')
  })

  it('génère un code certificat unique formaté', () => {
    const code = generateCertificateCode(80, 42)
    expect(code).toMatch(/^EDU-80-42-[A-Z0-9]+$/)
  })
})
