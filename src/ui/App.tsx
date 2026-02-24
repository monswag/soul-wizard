import { useState, useEffect, useMemo } from 'react'
import { LangProvider, useT } from '../i18n'
import { IntroScreen }    from './IntroScreen'
import { StepUserInfo }   from './steps/StepUserInfo'
import { StepQuiz }       from './steps/StepQuiz'
import { StepReveal }     from './steps/StepReveal'
import { StepSeal }       from './steps/StepSeal'

import { generateFiles, generateImagePrompt } from '../core/FileGenerator'
import { TGBridge, isTelegram, getStartParam } from '../core/TelegramBridge'
import { ARCHETYPES, computeArchetype } from '../core/archetypes'
import type { ArchetypeKey }        from '../core/archetypes'
import type { AgentIdentity, UserProfile, StyleChoices } from '../core/types'

// Steps: 0=intro 1=userinfo 2=quiz 3=reveal+tuning 4=seal
const TOTAL_STEPS = 5

const DEFAULT_AGENT: AgentIdentity = {
  name:        '',
  beingType:   'AI',
  temperament: '',
  emoji:       '✨',
  personality: { trait: '冷静', intensity: 0.5 },
  customTraits: [],
}

const DEFAULT_USER: UserProfile = {
  name: '', callMe: '', pronouns: '', timezone: '', notes: '',
}

const DEFAULT_CHOICES: StyleChoices = {
  communication: null,
  feedback:      null,
  output:        null,
  boundary:      null,
}

export function App() {
  return <LangProvider><AppInner /></LangProvider>
}

function AppInner() {
  const { t } = useT()
  const [step,       setStep]      = useState(0)
  const [agent,      setAgent]     = useState<AgentIdentity>(DEFAULT_AGENT)
  const [user,       setUser]      = useState<UserProfile>(DEFAULT_USER)
  const [choices,    setChoices]   = useState<StyleChoices>(DEFAULT_CHOICES)
  const [archetype,  setArchetype] = useState<ArchetypeKey | null>(null)
  const [done,       setDone]      = useState(false)
  const [directEdit, setDirectEdit] = useState(false)

  const [hasImgService]      = useState(() => getStartParam().includes('hasimg'))
  const [hasExistingConfig, setHasExistingConfig] = useState(() => {
    // Telegram: start_param contains 'hasexist'
    // Browser dev fallback: ?returning=1
    // Self-deployed / any device: localStorage flag set after first successful submit
    const devFlag   = new URLSearchParams(window.location.search).get('returning') === '1'
    const localFlag = localStorage.getItem('soul-wizard:configured') === '1'
    return getStartParam().includes('hasexist') || devFlag || localFlag
  })

  const avatarPrompt = useMemo(() => {
    if (!archetype) return ''
    const syncedAgent = { ...agent, temperament: ARCHETYPES[archetype].description }
    return generateImagePrompt(syncedAgent)
  }, [agent, archetype])

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const handleQuizComplete = (answers: number[]) => {
    const key = computeArchetype(answers)
    setArchetype(key)
    setChoices({ ...ARCHETYPES[key].defaultChoices })
    next()
  }

  useEffect(() => {
    TGBridge.ready()
    TGBridge.expand()
  }, [])

  const handleClose = () => {
    if (isTelegram) TGBridge.close()
    else { setDone(false); setStep(0) }
  }

  // Returning users skip directly to the reveal+sliders step, animation suppressed.
  // Restore last-used config from localStorage so sliders/agent reflect previous setup.
  const handleDirectEdit = () => {
    let restored = false
    const raw = localStorage.getItem('soul-wizard:last-config')
    if (raw) {
      try {
        const saved = JSON.parse(raw) as {
          agent?: AgentIdentity; choices?: StyleChoices; archetype?: ArchetypeKey
        }
        if (saved.agent)     setAgent(saved.agent)
        if (saved.choices)   setChoices(saved.choices)
        if (saved.archetype) { setArchetype(saved.archetype); restored = true }
      } catch { /* corrupted — fall through to default */ }
    }
    if (!restored && !archetype) {
      setArchetype('先知')
      setChoices({ ...ARCHETYPES['先知'].defaultChoices })
    }
    setDirectEdit(true)
    setStep(3)
  }

  const handleConfirm = (generateAvatar: boolean) => {
    const syncedAgent: AgentIdentity = archetype
      ? { ...agent, beingType: agent.beingType || 'AI', temperament: ARCHETYPES[archetype].description }
      : agent
    localStorage.setItem('soul-wizard:configured', '1')
    localStorage.setItem('soul-wizard:last-config', JSON.stringify({
      agent: syncedAgent, choices, archetype,
    }))
    setHasExistingConfig(true)
    if (isTelegram) {
      const files = generateFiles(syncedAgent, user, choices)
      TGBridge.sendData(JSON.stringify({
        identityMd:    files.identityMd,
        soulMd:        files.soulMd,
        userMd:        files.userMd,
        avatarPrompt:  generateAvatar ? files.imagePrompt : undefined,
        generateAvatar,
      }))
    } else {
      setDone(true)
    }
  }

  if (step === 0) return (
    <IntroScreen
      onNext={next}
      isReturning={hasExistingConfig}
      onDirectEdit={hasExistingConfig ? handleDirectEdit : undefined}
    />
  )

  const accent = archetype ? ARCHETYPES[archetype].colors.accent : '#c4872a'
  const pageBg = archetype && step >= 3 ? ARCHETYPES[archetype].colors.pageBg : undefined

  // Step 3 uses split layout (card-area + bottom-panel, no page scroll)
  const isRevealStep = step === 3 && !!archetype && !done

  return (
    <div
      className={`step-page${isRevealStep ? ' step-page--reveal' : ''}`}
      style={{
        '--accent': accent,
        ...(pageBg ? { '--bg-bottom': pageBg } : {}),
      } as React.CSSProperties}
    >
      {done ? (
        <div className="success-screen">
          <div className="success-emoji">{agent.emoji}</div>
          <div className="success-title">{t.success.title(agent.name)}</div>
          <div className="success-sub">{t.success.subtitle}</div>
          <button className="btn-ghost success-close-btn" onClick={handleClose}>{t.success.exit}</button>
        </div>
      ) : (
        <div className="step-body" key={step}>
          {step === 1 && (
            <StepUserInfo
              user={user} setUser={setUser}
              onNext={next} onPrev={prev}
            />
          )}

          {step === 2 && (
            <StepQuiz
              onComplete={handleQuizComplete}
              onPrev={prev}
            />
          )}

          {step === 3 && archetype && (
            <StepReveal
              archetypeKey={archetype}
              choices={choices}
              setChoices={setChoices}
              onNext={() => { setDirectEdit(false); next() }}
              onPrev={() => { setArchetype(null); setDirectEdit(false); prev() }}
              onArchetypeChange={k => setArchetype(k)}
              skipAnimation={directEdit}
            />
          )}

          {step === 4 && archetype && (
            <StepSeal
              agent={agent}
              setAgent={setAgent}
              archetypeKey={archetype}
              hasImgService={hasImgService}
              hasExistingConfig={hasExistingConfig}
              avatarPrompt={avatarPrompt}
              onPrev={prev}
              onConfirm={handleConfirm}
            />
          )}
        </div>
      )}
    </div>
  )
}
