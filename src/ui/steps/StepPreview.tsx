/**
 * Step 4 — 封印 Bonding
 * Give the agent a name + emoji, then confirm ("写入誓约").
 * Agent name goes to IDENTITY.md; emoji is used throughout.
 */
import { useState } from 'react'
import type { AgentIdentity } from '../../core/types'

const EMOJI_PRESETS = [
  '✨', '🔮', '⚡', '🌊', '🌙', '🔥',
  '🌀', '💫', '🎯', '🧬', '🪐', '👁️',
]

interface Props {
  agent:     AgentIdentity
  setAgent:  (a: AgentIdentity) => void
  onPrev:    () => void
  onConfirm: () => void
}

export function StepPreview({ agent, setAgent, onPrev, onConfirm }: Props) {
  const [customEmoji, setCustomEmoji] = useState('')

  const selectEmoji = (e: string) => {
    setCustomEmoji('')
    setAgent({ ...agent, emoji: e })
  }

  const canConfirm = agent.name.trim().length > 0

  return (
    <>
      <div className="step-phase">
        <span className="step-phase-num">4 · 封印</span>
        <span className="step-phase-name">Bonding</span>
      </div>
      <h1 className="step-title">给它起个名字，<br/>完成封印。</h1>

      <div className="field">
        <label className="field-label">名称</label>
        <input
          type="text"
          placeholder="叫它什么？"
          value={agent.name}
          onChange={e => setAgent({ ...agent, name: e.target.value })}
          autoFocus
        />
      </div>

      <div className="field">
        <label className="field-label">标志 emoji</label>
        <div className="emoji-grid">
          {EMOJI_PRESETS.map(e => (
            <button
              key={e}
              className={`emoji-btn${agent.emoji === e && !customEmoji ? ' selected' : ''}`}
              onClick={() => selectEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="或输入自定义 emoji"
          value={customEmoji}
          onChange={e => {
            setCustomEmoji(e.target.value)
            const first = [...e.target.value][0]
            if (first) setAgent({ ...agent, emoji: first })
          }}
          style={{ marginTop: 8 }}
        />
      </div>

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={onPrev}>← 返回</button>
        <button
          className="btn btn-primary"
          onClick={onConfirm}
          disabled={!canConfirm}
          style={{ flex: 1 }}
        >
          写入誓约 ✦
        </button>
      </div>
    </>
  )
}
