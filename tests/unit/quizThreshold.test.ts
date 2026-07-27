import { describe, it, expect } from 'vitest'
import {
  QUIZ_PASS_THRESHOLD,
  quizPercentage,
  isQuizPassed,
} from '../../server/utils/quizThreshold'

describe('quizThreshold (unit)', () => {
  it('expose le seuil de réussite à 70 %', () => {
    expect(QUIZ_PASS_THRESHOLD).toBe(70)
  })

  it('calcule un pourcentage arrondi', () => {
    expect(quizPercentage(7, 10)).toBe(70)
    expect(quizPercentage(8, 10)).toBe(80)
    expect(quizPercentage(0, 10)).toBe(0)
  })

  it('retourne 100 % si total = 0', () => {
    expect(quizPercentage(0, 0)).toBe(100)
  })

  it('valide la réussite au-dessus ou égal au seuil', () => {
    expect(isQuizPassed(7, 10)).toBe(true)
    expect(isQuizPassed(6, 10)).toBe(false)
    expect(isQuizPassed(14, 20)).toBe(true)
  })
})
