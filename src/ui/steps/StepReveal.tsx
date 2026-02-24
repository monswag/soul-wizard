/**
 * Step 3 — 揭示 + 塑造
 *
 * Silver card cover → confetti burst → face revealed → sliders slide in.
 * Sliders are continuous (0.01 step). Discrete choice snaps on Math.round().
 * The displayed archetype is computed live from slider positions via a balanced
 * lookup table (3 combos per archetype). Card animates when archetype changes.
 * Layout: card-area (top) + tune-panel (scrollable) + reveal-nav (pinned bottom).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { ARCHETYPES, computeArchetypeFromStyle, type ArchetypeKey } from '../../core/archetypes'
import type { StyleChoices } from '../../core/types'
import { useT } from '../../i18n'
import type { Translation } from '../../i18n/types'

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width  = rect.width  * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const W = rect.width, H = rect.height

    const COLORS = ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#ff9f45', '#c77dff', '#ffffff']
    const particles = Array.from({ length: 120 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 3 + Math.random() * 10
      return {
        x: W / 2, y: H / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        r: 4 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
        decay: 0.012 + Math.random() * 0.010,
        gravity: 0.22 + Math.random() * 0.14,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.28,
        isRect: Math.random() > 0.38,
      }
    })

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      let alive = false
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        p.vy += p.gravity; p.rot += p.spin
        p.alpha -= p.decay
        if (p.alpha <= 0) return
        alive = true
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        if (p.isRect) ctx.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9)
        else { ctx.beginPath(); ctx.arc(0, 0, p.r * 0.55, 0, Math.PI * 2); ctx.fill() }
        ctx.restore()
      })
      if (alive) raf = requestAnimationFrame(draw)
      else canvas.style.opacity = '0'
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 10,
      }}
    />
  )
}

// ─── Custom pointer slider (reliable drag on Telegram WebView) ────────────────

interface TuneSliderProps {
  min: number; max: number; value: number
  onChange: (v: number) => void
}

function TuneSlider({ min, max, value, onChange }: TuneSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pct = max > 0 ? (value / max) * 100 : 0

  const applyX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    onChange(min + ratio * (max - min))
  }

  return (
    <div
      ref={trackRef}
      className="tune-slider-custom"
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); applyX(e.clientX) }}
      onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) applyX(e.clientX) }}
    >
      <div className="tune-track">
        <div className="tune-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="tune-thumb" style={{ left: `${pct}%` }} />
    </div>
  )
}

// ─── Tune rows ────────────────────────────────────────────────────────────────

type TuneRow = { key: keyof SliderVals; left: string; right: string; values: string[] }

const TUNE_ROW_CONFIGS: { key: keyof SliderVals; values: string[] }[] = [
  { key: 'communication', values: ['advisor', 'partner'] },
  { key: 'feedback',      values: ['direct', 'gentle'] },
  { key: 'boundary',      values: ['always', 'private', 'soft'] },
]

type SliderVals = { communication: number; feedback: number; boundary: number }

function initSliderVals(choices: StyleChoices): SliderVals {
  return {
    communication: TUNE_ROW_CONFIGS[0].values.indexOf(choices.communication ?? 'advisor'),
    feedback:      TUNE_ROW_CONFIGS[1].values.indexOf(choices.feedback      ?? 'direct'),
    boundary:      TUNE_ROW_CONFIGS[2].values.indexOf(choices.boundary      ?? 'always'),
  }
}

// ─── Dynamic card content ─────────────────────────────────────────────────────

function styleNote(c: StyleChoices, notes: Translation['reveal']['styleNotes']): string {
  const key = `${c.communication}.${c.feedback}.${c.boundary}`
  return notes[key] ?? ''
}

function styleTags(c: StyleChoices, tags: Translation['reveal']['styleTags']): string[] {
  return [
    c.communication === 'partner' ? tags.partner : tags.advisor,
    c.feedback      === 'gentle'  ? tags.gentle  : tags.direct,
    c.boundary      === 'soft'    ? tags.soft     : c.boundary === 'private' ? tags.private : tags.always,
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  archetypeKey:       ArchetypeKey
  choices:            StyleChoices
  setChoices:         (c: StyleChoices) => void
  onNext:             () => void
  onPrev:             () => void
  onArchetypeChange?: (key: ArchetypeKey) => void
  skipAnimation?:     boolean   // true when entering from "direct edit" shortcut
}

export function StepReveal({ archetypeKey, choices, setChoices, onNext, onPrev, onArchetypeChange, skipAnimation = false }: Props) {
  const { t } = useT()
  const tuneRows: TuneRow[] = TUNE_ROW_CONFIGS.map((cfg, i) => ({
    ...cfg,
    left:  t.reveal.sliders[i].left,
    right: t.reveal.sliders[i].right,
  }))

  const [revealed,       setRevealed]       = useState(skipAnimation)
  const [confettiActive, setConfettiActive] = useState(false)
  const [slidersVisible, setSlidersVisible] = useState(skipAnimation)
  const [cardFading,     setCardFading]     = useState(false)
  const [cardShaking,    setCardShaking]    = useState(false)
  const [descVersion,    setDescVersion]    = useState(skipAnimation ? 1 : 0)
  const [sliderVals,     setSliderVals]     = useState(() => initSliderVals(choices))

  const cardFadingRef = useRef(false)

  // Live archetype derived from slider positions (balanced 3-3-3-3 lookup table).
  // Starts equal to the quiz-assigned archetypeKey; switches as user tunes sliders.
  const derivedKey = useMemo(
    () => computeArchetypeFromStyle(sliderVals),
    [sliderVals],
  )

  const arch = ARCHETYPES[derivedKey]

  // Variant image if provided; falls back to base image (ready for future assets).
  const currentImage = useMemo(() => {
    const comm = Math.round(sliderVals.communication)
    const feed = Math.round(sliderVals.feedback)
    if (comm === 1 && arch.imageVariants?.partner) return arch.imageVariants.partner
    if (feed === 1 && arch.imageVariants?.gentle)  return arch.imageVariants.gentle
    return arch.image
  }, [arch, sliderVals.communication, sliderVals.feedback])

  // Reveal sequence: shake at 600ms → stop at 1150ms → reveal + confetti at 1400ms → sliders at 3200ms
  // Skipped entirely when entering via "direct edit" shortcut
  useEffect(() => {
    if (skipAnimation) return
    const t0 = setTimeout(() => setCardShaking(true),  600)
    const t0b = setTimeout(() => setCardShaking(false), 1150)
    const t1 = setTimeout(() => { setRevealed(true); setConfettiActive(true) }, 1400)
    const t2 = setTimeout(() => { setSlidersVisible(true); setDescVersion(v => v + 1) }, 3200)
    return () => { clearTimeout(t0); clearTimeout(t0b); clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // When derived archetype changes, animate the card and notify parent
  const prevDerivedKeyRef = useRef<ArchetypeKey>(archetypeKey)
  useEffect(() => {
    if (prevDerivedKeyRef.current === derivedKey) return
    prevDerivedKeyRef.current = derivedKey
    onArchetypeChange?.(derivedKey)
    if (!cardFadingRef.current) {
      cardFadingRef.current = true
      setCardFading(true)
      setTimeout(() => { setCardFading(false); cardFadingRef.current = false }, 580)
    }
  }, [derivedKey, onArchetypeChange])

  const handleSliderChange = (row: TuneRow, floatVal: number) => {
    setSliderVals(prev => ({ ...prev, [row.key]: floatVal }))
    const choiceIdx = Math.max(0, Math.min(row.values.length - 1, Math.round(floatVal)))
    const choiceVal = row.values[choiceIdx]
    if (choices[row.key] === choiceVal) return
    setDescVersion(v => v + 1)
    setChoices({ ...choices, [row.key]: choiceVal } as StyleChoices)
  }

  const archI18n    = t.archetypes[derivedKey]
  const displayDesc = slidersVisible ? styleNote(choices, t.reveal.styleNotes) : archI18n.description
  const displayTags = slidersVisible ? styleTags(choices, t.reveal.styleTags)  : archI18n.tags

  const cardClass = [
    'archetype-card',
    revealed    ? 'revealed'     : '',
    cardFading  ? 'card-fading'  : '',
    cardShaking ? 'card-shaking' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* ── Card area ── */}
      <div className={`card-area${slidersVisible ? '' : ' card-area--pre-reveal'}`}>
        <div
          className={cardClass}
          style={{ '--card-glow': arch.card.glow } as React.CSSProperties}
        >
          <div className="archetype-card-cover">
            <img src="/cover-logo.png" className="cover-logo" alt="" />
          </div>
          <Confetti active={confettiActive} />
          <div
            className="archetype-card-face"
            style={{
              background:  arch.card.bg,
              color:       arch.card.text,
              borderColor: arch.card.border,
            }}
          >
            <img
              key={currentImage}
              src={currentImage}
              alt={archI18n.name}
              className="archetype-card-image"
            />
            <div className="archetype-card-info">
              <div className="archetype-name">{archI18n.name}</div>
              <div className="archetype-subtitle">{archI18n.subtitle}</div>
              <p key={`d-${descVersion}`} className="archetype-desc">{displayDesc}</p>
              <div key={`t-${descVersion}`} className="archetype-tags">
                {displayTags.map(t => <span key={t} className="archetype-tag">{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tune panel: sliders scroll independently ── */}
      {slidersVisible && (
        <div className="tune-panel sliders-appear">
          <div className="tune-section">
            {tuneRows.map(row => {
              const max = row.values.length - 1
              return (
                <div key={row.key} className="tune-row">
                  <span className="tune-end">{row.left}</span>
                  <TuneSlider
                    min={0}
                    max={max}
                    value={sliderVals[row.key]}
                    onChange={v => handleSliderChange(row, v)}
                  />
                  <span className="tune-end">{row.right}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Nav: always pinned to bottom ── */}
      {slidersVisible && (
        <div className="reveal-nav sliders-appear">
          <button className="btn-ghost" onClick={onPrev}>{t.reveal.retake}</button>
          <button className="btn-primary" onClick={onNext}>{t.reveal.confirm}</button>
        </div>
      )}
    </>
  )
}
