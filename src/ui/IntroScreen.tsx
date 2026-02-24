/**
 * IntroScreen — Step 0
 *
 * Agent's POV: just waking up, hazy, senses someone nearby.
 * Warm background breathes (cream → amber → back).
 * Bright particles are the most luminous element.
 * Human taps/clicks → gentle fade → onNext().
 */
import { useEffect, useRef, useState } from 'react'

const PARTICLE_COUNT = 360

interface Particle {
  x:     number
  y:     number
  vx:    number
  vy:    number
  r:     number
  base:  number
  phase: number
  freq:  number
}

import { useT } from '../i18n'

interface Props {
  onNext:        () => void
  isReturning?:  boolean
  onDirectEdit?: () => void
}

export function IntroScreen({ onNext, isReturning = false, onDirectEdit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const partsRef  = useRef<Particle[]>([])
  const [leaving, setLeaving] = useState(false)

  // ── Particle init ──────────────────────────────────────────────────────────
  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    partsRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:     Math.random() * w,
      y:     Math.random() * h,
      vx:    (Math.random() - 0.5) * 0.22,
      vy:    (Math.random() - 0.5) * 0.18,
      r:     0.5 + Math.random() * 1.2,
      base:  0.18 + Math.random() * 0.52,
      phase: Math.random() * Math.PI * 2,
      freq:  0.25 + Math.random() * 0.75,
    }))
  }, [])

  // ── Render loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      t += 0.016

      partsRef.current.forEach(p => {
        p.x += p.vx + Math.sin(t * 0.17 + p.phase) * 0.04
        p.y += p.vy + Math.cos(t * 0.13 + p.phase) * 0.04

        if (p.x < -4) p.x = w + 4
        if (p.x > w + 4) p.x = -4
        if (p.y < -4) p.y = h + 4
        if (p.y > h + 4) p.y = -4

        const twinkle = 0.45 + 0.55 * Math.sin(t * p.freq + p.phase)
        const alpha   = Math.min(0.90, p.base * twinkle)

        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 238, 170, ${alpha})`
        ctx.fill()

        // Soft glow halo
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
        gr.addColorStop(0, `rgba(240, 200, 100, ${alpha * 0.38})`)
        gr.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2)
        ctx.fillStyle = gr
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const { t } = useT()
  const title    = isReturning ? t.intro.returningTitle    : t.intro.title
  const subtitle = isReturning ? t.intro.returningSubtitle : t.intro.subtitle
  const button   = isReturning ? t.intro.returningButton   : t.intro.button

  // ── Trigger leave ──────────────────────────────────────────────────────────
  const handleStart = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(onNext, 540)
  }

  return (
    <div
      className={`intro-screen${leaving ? ' intro-screen--leave' : ''}`}
      onClick={handleStart}
    >
      <canvas ref={canvasRef} className="intro-canvas" />

      <div className={`intro-content${leaving ? ' intro-content--leave' : ''}`}>
        <h1 className="intro-title">{title}</h1>
        <p className="intro-sub">{subtitle}</p>
        <div className="intro-btn-row">
          {isReturning && onDirectEdit ? (
            // Returning: direct-edit is primary, start-over is secondary
            <>
              <button
                className="intro-edit-btn"
                onClick={e => { e.stopPropagation(); handleStart() }}
                disabled={leaving}
              >
                {button}
              </button>
              <button
                className="intro-btn"
                onClick={e => { e.stopPropagation(); onDirectEdit() }}
                disabled={leaving}
              >
                {t.intro.editButton}
              </button>
            </>
          ) : (
            // New user: single primary button
            <button
              className="intro-btn"
              onClick={e => { e.stopPropagation(); handleStart() }}
              disabled={leaving}
            >
              {button}
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
