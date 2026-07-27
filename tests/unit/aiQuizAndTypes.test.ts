import { describe, it, expect } from 'vitest'
import { normalizeQuiz } from '../../server/utils/aiQuiz'
import { extractYouTubeId } from '../../server/utils/youtubeTranscript'
import { LESSON_TYPE_CONFIG, LESSON_CONTENT_TYPES } from '../../app/utils/lessonTypes'

describe('normalizeQuiz (unit)', () => {
  it('normalise un quiz IA et force une seule bonne réponse', () => {
    const quiz = normalizeQuiz({
      title: 'Quiz Linux',
      questions: [
        {
          text: 'Quelle commande liste les fichiers ?',
          options: [
            { text: 'ls', isCorrect: true },
            { text: 'cd', isCorrect: true },
            { text: 'pwd', isCorrect: false },
          ],
        },
      ],
    }, 5)

    expect(quiz.title).toBe('Quiz Linux')
    expect(quiz.questions).toHaveLength(1)
    const correct = quiz.questions[0].options.filter(o => o.isCorrect)
    expect(correct).toHaveLength(1)
    expect(correct[0].text).toBe('ls')
  })

  it('choisit la première option si aucune n’est correcte', () => {
    const quiz = normalizeQuiz({
      questions: [{
        text: 'Q1',
        options: [
          { text: 'A', isCorrect: false },
          { text: 'B', isCorrect: false },
        ],
      }],
    }, 3)
    expect(quiz.questions[0].options[0].isCorrect).toBe(true)
  })

  it('échoue si aucune question valide', () => {
    expect(() => normalizeQuiz({ questions: [] }, 3)).toThrow()
  })
})

describe('youtubeTranscript extractYouTubeId (unit)', () => {
  it('supporte shorts et watch', () => {
    expect(extractYouTubeId('https://www.youtube.com/shorts/abcdefghijk')).toBe('abcdefghijk')
    expect(extractYouTubeId('https://www.youtube.com/watch?v=abcdefghijk')).toBe('abcdefghijk')
    expect(extractYouTubeId('bad')).toBeNull()
  })
})

describe('lessonTypes (unit)', () => {
  it('définit les 4 types de leçon', () => {
    expect(Object.keys(LESSON_TYPE_CONFIG).sort()).toEqual(['pdf', 'quiz', 'text', 'video'])
    expect(LESSON_CONTENT_TYPES.map(t => t.value)).toEqual(['video', 'text', 'quiz', 'pdf'])
  })
})
