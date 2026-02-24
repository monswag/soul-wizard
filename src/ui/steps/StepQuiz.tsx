/**
 * Step 2 — 分院
 * Three questions, one at a time.
 * After Q3, calls onComplete(answers).
 */
import { useState } from 'react'
import { useT } from '../../i18n'

interface Props {
  onComplete: (answers: number[]) => void
  onPrev:     () => void
}

export function StepQuiz({ onComplete, onPrev }: Props) {
  const { t } = useT()
  const [qi,      setQi]      = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [chosen,  setChosen]  = useState<number | null>(null)
  const [exiting, setExiting] = useState(false)

  const questions = t.quiz.questions
  const current   = questions[qi]

  const choose = (optIndex: number) => {
    if (chosen !== null || exiting) return
    setChosen(optIndex)

    setTimeout(() => {
      const next = [...answers, optIndex]
      if (qi < questions.length - 1) {
        setExiting(true)
        setTimeout(() => {
          setAnswers(next)
          setQi(qi + 1)
          setChosen(null)
          setExiting(false)
        }, 300)
      } else {
        onComplete(next)
      }
    }, 320)
  }

  return (
    <>
      {/* Progress dots */}
      <div className="quiz-progress">
        {questions.map((_, i) => (
          <div key={i} className={`quiz-dot${i < qi ? ' done' : i === qi ? ' active' : ''}`} />
        ))}
      </div>

      <div className={`quiz-question${exiting ? ' quiz-question--exit' : ''}`} key={qi}>
        <h2 className="quiz-q">{current.q}</h2>
        <p className="quiz-hint">{t.quiz.hint}</p>

        <div className="quiz-options">
          {current.options.map((opt, i) => (
            <button
              key={i}
              className={`quiz-opt${chosen === i ? ' quiz-opt--chosen' : ''}`}
              onClick={() => choose(i)}
              disabled={chosen !== null}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {qi === 0 && (
        <div className="nav-row" style={{ marginTop: 'auto' }}>
          <button className="btn-ghost" onClick={onPrev}>{t.quiz.back}</button>
        </div>
      )}
    </>
  )
}
