/**
 * Step 4 — 塑造
 * Shows a mini archetype card + 3 slider dimensions.
 * Mini card pulses when any slider changes.
 * Defaults from the archetype are pre-filled.
 */
import { useState } from 'react'
import { ARCHETYPES, type ArchetypeKey } from '../../core/archetypes'
import type { StyleChoices } from '../../core/types'

interface Props {
  archetypeKey: ArchetypeKey
  choices:      StyleChoices
  setChoices:   (c: StyleChoices) => void
  onNext:       () => void
  onPrev:       () => void
}

type TuneRow = {
  label:  string
  key:    keyof StyleChoices
  left:   string
  right:  string
  values: string[]
}

const TUNE_ROWS: TuneRow[] = [
  {
    label:  '说话方式',
    key:    'communication',
    left:   '顾问式',
    right:  '搭档式',
    values: ['advisor', 'partner'],
  },
  {
    label:  '反馈方式',
    key:    'feedback',
    left:   '直接指出',
    right:  '先帮完成',
    values: ['direct', 'gentle'],
  },
  {
    label:  '边界感',
    key:    'boundary',
    left:   '随时直说',
    right:  '总是委婉',
    values: ['always', 'private', 'soft'],
  },
]

export function StepTuning({ archetypeKey, choices, setChoices, onNext, onPrev }: Props) {
  const [pulsing, setPulsing] = useState(false)
  const arch = ARCHETYPES[archetypeKey]

  const change = (key: keyof StyleChoices, idx: number, values: string[]) => {
    setChoices({ ...choices, [key]: values[idx] })
    setPulsing(true)
    setTimeout(() => setPulsing(false), 500)
  }

  const getIndex = (key: keyof StyleChoices, values: string[]) => {
    const current = choices[key]
    const idx = values.indexOf(current ?? '')
    return idx >= 0 ? idx : 0
  }

  return (
    <>
      <div className="step-phase">
        <span className="step-phase-num">4</span>
        <span className="step-phase-name">塑造</span>
      </div>

      {/* Mini card */}
      <div
        className={`mini-card${pulsing ? ' mini-card--pulse' : ''}`}
        style={{
          borderColor: arch.card.border,
          '--accent': arch.colors.accent,
        } as React.CSSProperties}
      >
        <img src={arch.image} alt={arch.name} className="mini-card-image" />
        <div className="mini-card-info">
          <span className="mini-card-name">{arch.name}</span>
          <span className="mini-card-note">核心特质保持不变</span>
        </div>
      </div>

      <p className="step-sub">默认已经是它的风格，细节上可以微调。</p>

      {/* Sliders */}
      <div className="tune-section">
        {TUNE_ROWS.map(row => (
          <div key={row.key} className="tune-row">
            <span className="tune-label">{row.label}</span>
            <div className="tune-labels">
              <span>{row.left}</span>
              <span>{row.right}</span>
            </div>
            <input
              type="range"
              className="tune-slider"
              min={0}
              max={row.values.length - 1}
              step={1}
              value={getIndex(row.key, row.values)}
              onChange={e => change(row.key, Number(e.target.value), row.values)}
            />
          </div>
        ))}
      </div>

      <div className="nav-row" style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button className="btn-ghost" onClick={onPrev}>← 返回</button>
        <button className="btn-primary" onClick={onNext}>就这样 →</button>
      </div>
    </>
  )
}
