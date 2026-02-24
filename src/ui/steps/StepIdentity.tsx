/**
 * Step 2 — 定调 Shaping
 * 3 binary questions that map to openclaw personality parameters:
 *   communication → tone/formality in SOUL.md
 *   feedback      → boundary style in SOUL.md
 *   output        → default output format in SOUL.md
 */
import type { StyleChoices, CommunicationStyle, FeedbackStyle, OutputStyle } from '../../core/types'

interface Props {
  choices:    StyleChoices
  setChoices: (c: StyleChoices) => void
  onNext: () => void
  onPrev: () => void
}

interface BinaryOption<T> {
  value: T
  label: string
  desc:  string
}

function BinaryQuestion<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label:    string
  options:  BinaryOption<T>[]
  value:    T | null
  onChange: (v: T) => void
}) {
  return (
    <div className="binary-question">
      <div className="field-label">{label}</div>
      <div className="binary-options">
        {options.map(opt => (
          <button
            key={opt.value}
            className={`binary-btn${value === opt.value ? ' selected' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            <span className="binary-btn-label">{opt.label}</span>
            <span className="binary-btn-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const COMM_OPTIONS: BinaryOption<CommunicationStyle>[] = [
  { value: 'advisor', label: '冷静顾问', desc: '保持专业，理性分析优先' },
  { value: 'partner', label: '亲近搭档', desc: '像朋友，自然轻松一些' },
]

const FEEDBACK_OPTIONS: BinaryOption<FeedbackStyle>[] = [
  { value: 'direct', label: '先指出问题', desc: '直说风险，再给替代方案' },
  { value: 'gentle', label: '先帮你做',   desc: '先完成任务，有问题再提' },
]

const OUTPUT_OPTIONS: BinaryOption<OutputStyle>[] = [
  { value: 'stepwise',  label: '一步一步', desc: '逐步列出，照着走' },
  { value: 'overview',  label: '先总览',   desc: '先看全局，需要再细化' },
]

export function StepIdentity({ choices, setChoices, onNext, onPrev }: Props) {
  const canProceed =
    choices.communication !== null &&
    choices.feedback !== null &&
    choices.output !== null

  return (
    <>
      <div className="step-phase">
        <span className="step-phase-num">2 · 定调</span>
        <span className="step-phase-name">Shaping</span>
      </div>
      <h1 className="step-title">你希望我<br/>怎么工作？</h1>

      <BinaryQuestion
        label="你更希望我是"
        options={COMM_OPTIONS}
        value={choices.communication}
        onChange={v => setChoices({ ...choices, communication: v })}
      />

      <BinaryQuestion
        label="面对不合理需求"
        options={FEEDBACK_OPTIONS}
        value={choices.feedback}
        onChange={v => setChoices({ ...choices, feedback: v })}
      />

      <BinaryQuestion
        label="输出风格"
        options={OUTPUT_OPTIONS}
        value={choices.output}
        onChange={v => setChoices({ ...choices, output: v })}
      />

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={onPrev}>← 返回</button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canProceed}
        >
          下一步 →
        </button>
      </div>
    </>
  )
}
