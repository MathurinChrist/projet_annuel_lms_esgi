/** Minimum score (%) to pass a module quiz or the final exam */
export const QUIZ_PASS_THRESHOLD = 70

export function quizPercentage(score: number, total: number): number {
  if (total <= 0) return 100
  return Math.round((score / total) * 100)
}

export function isQuizPassed(score: number, total: number): boolean {
  return quizPercentage(score, total) >= QUIZ_PASS_THRESHOLD
}
