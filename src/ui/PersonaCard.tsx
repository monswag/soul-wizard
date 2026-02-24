import type { AgentIdentity, UserProfile, StyleChoices } from '../core/types'

interface Props {
  agent: AgentIdentity
  user:  UserProfile
  choices: StyleChoices
  step: number
}

const COMM_LABEL:  Record<string, string> = { advisor: '冷静顾问', partner: '亲近搭档' }
const FEED_LABEL:  Record<string, string> = { direct: '直接指出问题', gentle: '先执行再提醒' }
const OUT_LABEL:   Record<string, string> = { stepwise: '逐步展开', overview: '先总览再深入' }
const BOUND_LABEL: Record<string, string> = { always: '公开也直说', private: '私下才直说', soft: '尽量委婉' }

export function PersonaCard({ agent, user, choices, step }: Props) {
  if (step === 0) {
    return (
      <div className="persona-card persona-card--dormant">
        <div className="persona-dormant-dot" />
        <span className="persona-dormant-text">等待唤醒…</span>
      </div>
    )
  }

  const hasChoices = choices.communication || choices.feedback || choices.output

  return (
    <div className="persona-card">
      {/* Header: emoji + name */}
      <div className="persona-header">
        <span className="persona-emoji">{agent.emoji}</span>
        <span className="persona-name">
          {agent.name || <span className="persona-name--placeholder">——</span>}
        </span>
      </div>

      {/* User row */}
      {step >= 1 && user.name && (
        <div className="persona-row">
          <span className="persona-label">认识了</span>
          <span className="persona-value">{user.callMe || user.name}</span>
        </div>
      )}

      {/* Choices rows */}
      {step >= 2 && hasChoices && (
        <div className="persona-divider" />
      )}

      {step >= 2 && choices.communication && (
        <div className="persona-row">
          <span className="persona-label">沟通方式</span>
          <span className="persona-value">{COMM_LABEL[choices.communication]}</span>
        </div>
      )}
      {step >= 2 && choices.feedback && (
        <div className="persona-row">
          <span className="persona-label">反馈风格</span>
          <span className="persona-value">{FEED_LABEL[choices.feedback]}</span>
        </div>
      )}
      {step >= 2 && choices.output && (
        <div className="persona-row">
          <span className="persona-label">输出格式</span>
          <span className="persona-value">{OUT_LABEL[choices.output]}</span>
        </div>
      )}

      {/* Boundary row */}
      {step >= 3 && choices.boundary && (
        <div className="persona-row">
          <span className="persona-label">公开场合</span>
          <span className="persona-value">{BOUND_LABEL[choices.boundary]}</span>
        </div>
      )}
    </div>
  )
}
