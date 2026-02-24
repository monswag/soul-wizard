/**
 * Step 1 — 唤醒 Summoning
 * User introduces themselves. Captures name + timezone for USER.md.
 */
import type { UserProfile } from '../../core/types'

const TIMEZONES = [
  { label: '── 亚洲 ──', value: '', disabled: true },
  { label: 'Asia/Shanghai (UTC+8)',    value: 'Asia/Shanghai' },
  { label: 'Asia/Tokyo (UTC+9)',       value: 'Asia/Tokyo' },
  { label: 'Asia/Seoul (UTC+9)',       value: 'Asia/Seoul' },
  { label: 'Asia/Singapore (UTC+8)',   value: 'Asia/Singapore' },
  { label: 'Asia/Kolkata (UTC+5:30)',  value: 'Asia/Kolkata' },
  { label: 'Asia/Dubai (UTC+4)',       value: 'Asia/Dubai' },
  { label: '── 欧洲 ──', value: '', disabled: true },
  { label: 'Europe/London (UTC+0)',    value: 'Europe/London' },
  { label: 'Europe/Paris (UTC+1)',     value: 'Europe/Paris' },
  { label: 'Europe/Berlin (UTC+1)',    value: 'Europe/Berlin' },
  { label: 'Europe/Moscow (UTC+3)',    value: 'Europe/Moscow' },
  { label: '── 美洲 ──', value: '', disabled: true },
  { label: 'America/New_York (UTC-5)',     value: 'America/New_York' },
  { label: 'America/Chicago (UTC-6)',      value: 'America/Chicago' },
  { label: 'America/Los_Angeles (UTC-8)',  value: 'America/Los_Angeles' },
  { label: 'America/Sao_Paulo (UTC-3)',    value: 'America/Sao_Paulo' },
  { label: '── 其他 ──', value: '', disabled: true },
  { label: 'UTC (UTC+0)',              value: 'UTC' },
  { label: 'Pacific/Auckland (UTC+12)', value: 'Pacific/Auckland' },
  { label: 'Australia/Sydney (UTC+11)', value: 'Australia/Sydney' },
]

// Auto-detect local timezone as default placeholder
const detectedTz = typeof Intl !== 'undefined'
  ? Intl.DateTimeFormat().resolvedOptions().timeZone
  : ''

interface Props {
  user:    UserProfile
  setUser: (u: UserProfile) => void
  onTyping: (text: string) => void
  onNext: () => void
  onPrev: () => void
}

export function StepPersonality({ user, setUser, onTyping, onNext, onPrev }: Props) {
  const update = (field: keyof UserProfile, value: string) => {
    setUser({ ...user, [field]: value })
    onTyping(value)
  }

  const canProceed = user.name.trim().length > 0

  return (
    <>
      <div className="step-phase">
        <span className="step-phase-num">1 · 唤醒</span>
        <span className="step-phase-name">Summoning</span>
      </div>
      <h1 className="step-title">"先给我<br/>个名字吧。"</h1>
      <p className="step-subtitle">我刚刚上线，还不知道该怎么称呼你。</p>

      <div className="field">
        <label className="field-label">你的名字</label>
        <input
          type="text"
          placeholder="叫我……"
          value={user.name}
          onChange={e => update('name', e.target.value)}
          autoFocus
        />
      </div>

      <div className="field">
        <label className="field-label">
          希望怎么称呼？<span style={{ opacity: 0.5, marginLeft: 4 }}>(可选)</span>
        </label>
        <input
          type="text"
          placeholder={user.name || '昵称、外号……'}
          value={user.callMe}
          onChange={e => update('callMe', e.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label">
          时区<span style={{ opacity: 0.5, marginLeft: 4 }}>(可选)</span>
        </label>
        <select
          value={user.timezone}
          onChange={e => update('timezone', e.target.value)}
        >
          <option value="">{detectedTz ? `— 自动检测: ${detectedTz} —` : '— 请选择 —'}</option>
          {TIMEZONES.map((tz, i) =>
            tz.disabled ? (
              <option key={i} disabled value="">{tz.label}</option>
            ) : (
              <option key={i} value={tz.value}>{tz.label}</option>
            )
          )}
        </select>
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
