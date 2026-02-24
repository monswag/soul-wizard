/**
 * Step 5 — 封印
 * Name the agent, pick emoji + being type, decide on avatar generation.
 */
import { useRef, useState } from 'react'
import type { AgentIdentity, BeingType } from '../../core/types'
import type { ArchetypeKey } from '../../core/archetypes'
import { useT } from '../../i18n'

const EMOJI_PRESETS = ['✨', '🔮', '⚡', '🌊', '🌙', '🔥']
const BEING_PRESETS: BeingType[] = ['AI', '使魔', '幽灵', '机器人', '神谕']

interface Props {
  agent:              AgentIdentity
  setAgent:           (a: AgentIdentity) => void
  archetypeKey:       ArchetypeKey
  hasImgService:      boolean
  hasExistingConfig:  boolean
  avatarPrompt:       string
  onPrev:             () => void
  onConfirm:          (generateAvatar: boolean) => void
}

export function StepSeal({
  agent, setAgent, archetypeKey: _archetypeKey,
  hasImgService, hasExistingConfig, avatarPrompt,
  onPrev, onConfirm,
}: Props) {
  const { t } = useT()
  const [customEmoji,  setCustomEmoji]  = useState('')
  const [customBeing,  setCustomBeing]  = useState(
    () => BEING_PRESETS.includes(agent.beingType as BeingType) ? '' : agent.beingType,
  )
  const [traitInput,     setTraitInput]     = useState('')
  const [generateAvatar, setGenerateAvatar] = useState(hasImgService)
  const [copied,         setCopied]         = useState(false)
  const traitRef = useRef<HTMLInputElement>(null)

  const addTrait = (val: string) => {
    const trimmed = val.replace(/[,，]$/, '').trim()
    if (trimmed && !agent.customTraits.includes(trimmed)) {
      setAgent({ ...agent, customTraits: [...agent.customTraits, trimmed] })
    }
    setTraitInput('')
    setTimeout(() => traitRef.current?.focus(), 0)
  }

  const removeTrait = (t: string) => {
    setAgent({ ...agent, customTraits: agent.customTraits.filter(x => x !== t) })
  }

  const selectedPreset = !customBeing && BEING_PRESETS.includes(agent.beingType as BeingType)
    ? agent.beingType as BeingType
    : null

  const selectEmoji = (e: string) => {
    setCustomEmoji('')
    setAgent({ ...agent, emoji: e })
  }

  const selectBeing = (b: BeingType) => {
    setCustomBeing('')
    setAgent({ ...agent, beingType: b })
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(avatarPrompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const canConfirm = agent.name.trim().length > 0

  return (
    <>
      <h1 className="step-title">{t.seal.title}</h1>

      <div className="field" style={{ marginTop: 8 }}>
        <input
          type="text"
          placeholder={t.seal.namePlaceholder}
          autoComplete="off"
          value={agent.name}
          onChange={e => setAgent({ ...agent, name: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          autoFocus
        />
      </div>

      <div className="field">
        <label className="field-label">{t.seal.emojiLabel}</label>
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
          placeholder={t.seal.emojiCustomPlaceholder}
          value={customEmoji}
          onChange={e => {
            setCustomEmoji(e.target.value)
            const first = [...e.target.value][0]
            if (first) setAgent({ ...agent, emoji: first })
          }}
          style={{ marginTop: 8 }}
        />
      </div>

      <div className="field">
        <label className="field-label">{t.seal.beingLabel}</label>
        <div className="being-grid">
          {BEING_PRESETS.map(b => (
            <button
              key={b}
              className={`being-btn${selectedPreset === b ? ' selected' : ''}`}
              onClick={() => selectBeing(b)}
            >
              {t.seal.beingDisplayNames[b] ?? b}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder={t.seal.beingCustomPlaceholder}
          value={customBeing}
          onChange={e => {
            setCustomBeing(e.target.value)
            if (e.target.value) setAgent({ ...agent, beingType: e.target.value })
          }}
          style={{ marginTop: 8 }}
        />
      </div>

      <div className="field">
        <label className="field-label">{t.seal.traitsLabel} <span className="field-optional">{t.seal.traitsOptional}</span></label>
        {agent.customTraits.length > 0 && (
          <div className="trait-tags">
            {agent.customTraits.map(t => (
              <span key={t} className="trait-tag">
                {t}
                <button className="trait-remove" onClick={() => removeTrait(t)}>×</button>
              </span>
            ))}
          </div>
        )}
        <input
          ref={traitRef}
          type="text"
          placeholder={t.seal.traitsPlaceholder}
          value={traitInput}
          onChange={e => {
            const v = e.target.value
            if (v.endsWith(',') || v.endsWith('，')) { addTrait(v.slice(0, -1)); return }
            setTraitInput(v)
          }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTrait(traitInput) } }}
          style={{ marginTop: agent.customTraits.length > 0 ? 8 : 0 }}
        />
      </div>

      <div className="field">
        <label className="field-label">{t.seal.avatarLabel}</label>
        {hasImgService ? (
          <div className="avatar-choice">
            <span className="avatar-choice-label">{t.seal.avatarQuestion}</span>
            <div className="avatar-choice-btns">
              <button
                className={`choice-btn${!generateAvatar ? ' selected' : ''}`}
                onClick={() => setGenerateAvatar(false)}
              >{t.seal.skip}</button>
              <button
                className={`choice-btn${generateAvatar ? ' selected' : ''}`}
                onClick={() => setGenerateAvatar(true)}
              >{t.seal.generate}</button>
            </div>
          </div>
        ) : (
          <button className="btn-ghost btn-copy-prompt" onClick={handleCopyPrompt}>
            {copied ? t.seal.copied : t.seal.copyPrompt}
          </button>
        )}
      </div>

      {hasExistingConfig && (
        <p className="overwrite-warning">{t.seal.overwriteWarning}</p>
      )}

      <div className="nav-row" style={{ marginTop: hasExistingConfig ? 8 : 'auto' }}>
        <button className="btn-ghost" onClick={onPrev}>{t.seal.back}</button>
        <button
          className="btn-primary"
          onClick={() => onConfirm(generateAvatar)}
          disabled={!canConfirm}
        >
          {t.seal.confirm}
        </button>
      </div>
    </>
  )
}
