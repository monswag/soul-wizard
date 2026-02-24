/**
 * Step 3 — 赋形 Embodiment
 * Agent's self-intro + question about public directness.
 * Maps to the "边界" (boundary) section in openclaw SOUL.md.
 */
import type { StyleChoices, BoundaryChoice } from '../../core/types'

interface Props {
  choices:     StyleChoices
  boundary:    BoundaryChoice | null
  setBoundary: (b: BoundaryChoice) => void
  onNext: () => void
  onPrev: () => void
}

const BOUNDARY_OPTIONS: { value: BoundaryChoice; label: string; desc: string }[] = [
  { value: 'always',  label: '公开也直说',   desc: '任何场合都据实相告' },
  { value: 'private', label: '私下才直说',   desc: '当着他人时委婉一些' },
  { value: 'soft',    label: '总是委婉一些', desc: '所有场合都用温和方式' },
]

function getAgentSpeech(choices: StyleChoices): string {
  if (choices.communication === 'advisor' && choices.feedback === 'direct') {
    return '我倾向于直说问题本质，不绕弯子。你希望我在公开场合也这样吗？'
  }
  if (choices.feedback === 'direct') {
    return '我会直说风险再给方案。你希望我在公开场合也保持这个风格吗？'
  }
  return '有时候我会把问题说得比较直接。你希望我在其他人面前也这样吗？'
}

export function StepUser({ choices, boundary, setBoundary, onNext, onPrev }: Props) {
  const canProceed = boundary !== null

  return (
    <>
      <div className="step-phase">
        <span className="step-phase-num">3 · 赋形</span>
        <span className="step-phase-name">Embodiment</span>
      </div>
      <h1 className="step-title" style={{ fontSize: '18px', lineHeight: 1.55 }}>
        "{getAgentSpeech(choices)}"
      </h1>

      <div className="dialogue-options">
        {BOUNDARY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`dialogue-btn${boundary === opt.value ? ' selected' : ''}`}
            onClick={() => setBoundary(opt.value)}
          >
            <span style={{ fontWeight: 500, display: 'block' }}>{opt.label}</span>
            <span style={{ fontSize: '12px', opacity: 0.65, display: 'block', marginTop: 2 }}>{opt.desc}</span>
          </button>
        ))}
      </div>

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
