import { useRef, useCallback } from 'react'
import type { PersonalityTrait } from '../core/types'

export interface QuadrantPosition {
  x: number  // 0=沉稳  1=激烈
  y: number  // 0=感性  1=理性
}

// ─── Corner definitions ───────────────────────────────────────────────────────
// Corners: tl=(0,1) tr=(1,1) bl=(0,0) br=(1,0)

const CORNERS = [
  { trait: '冷静' as PersonalityTrait, color: '#a07aff', cls: 'q-tl', label: '克制', sub: '沉稳 · 理性' },
  { trait: '果决' as PersonalityTrait, color: '#ff6060', cls: 'q-tr', label: '果决', sub: '锋锐 · 理性' },
  { trait: '温柔' as PersonalityTrait, color: '#55b8ff', cls: 'q-bl', label: '温柔', sub: '细腻 · 感性' },
  { trait: '活泼' as PersonalityTrait, color: '#ffd060', cls: 'q-br', label: '热情', sub: '奔放 · 感性' },
]

// ─── Word pools per corner ───────────────────────────────────────────────────

const WORDS = {
  tl: ['沉稳', '克制', '深邃', '笃定'],
  tr: ['果决', '锋锐', '清醒', '凌厉'],
  bl: ['温柔', '细腻', '包容', '柔和'],
  br: ['热情', '奔放', '感性', '鲜活'],
}

function getDescription(pos: QuadrantPosition): string {
  const { x, y } = pos
  const dist = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) * Math.SQRT2
  if (dist < 0.14) return '拖动来塑造气质'

  // Corner proximity weights: tl=(1-x)*y  tr=x*y  bl=(1-x)*(1-y)  br=x*(1-y)
  const w = {
    tl: (1 - x) * y,
    tr: x * y,
    bl: (1 - x) * (1 - y),
    br: x * (1 - y),
  }

  const sorted = (Object.entries(w) as [keyof typeof WORDS, number][])
    .sort((a, b) => b[1] - a[1])
  const [top1, top2] = sorted

  // Clearly in one quadrant
  if (top1[1] > top2[1] * 2.5) {
    return `${WORDS[top1[0]][0]} · ${WORDS[top1[0]][1]}`
  }

  // Between two quadrants — blend first word of each
  return `${WORDS[top1[0]][0]} · ${WORDS[top2[0]][0]}`
}

// Corner opacity driven by proximity to dot: active corner bright, others dim
function getCornerOpacity(cls: string, pos: QuadrantPosition): number {
  const { x, y } = pos
  const weights: Record<string, number> = {
    'q-tl': (1 - x) * y,
    'q-tr': x * y,
    'q-bl': (1 - x) * (1 - y),
    'q-br': x * (1 - y),
  }
  const w = weights[cls] ?? 0.25
  // Map weight [0..0.5+] → opacity [0.25..1.0]
  return Math.min(1.0, 0.25 + w * 1.5)
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export function getDominantTrait(pos: QuadrantPosition): PersonalityTrait {
  if (pos.x >= 0.5 && pos.y >= 0.5) return '果决'
  if (pos.x <  0.5 && pos.y >= 0.5) return '冷静'
  if (pos.x <  0.5 && pos.y <  0.5) return '温柔'
  return '活泼'
}

export function getIntensity(pos: QuadrantPosition): number {
  const dx = pos.x - 0.5
  const dy = pos.y - 0.5
  return Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2 * Math.SQRT2)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  position: QuadrantPosition
  onChange: (pos: QuadrantPosition) => void
}

export function QuadrantSelector({ position, onChange }: Props) {
  const ref      = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const posFromXY = useCallback((clientX: number, clientY: number) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left)  / rect.width))
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
    onChange({ x, y })
  }, [onChange])

  // ── Mouse ──────────────────────────────────────────────────────────────────

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    posFromXY(e.clientX, e.clientY)
    const onMove = (ev: MouseEvent) => { if (dragging.current) posFromXY(ev.clientX, ev.clientY) }
    const onUp   = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp, { once: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [posFromXY])

  // ── Touch — stops propagation so parent swipe nav doesn't fire ─────────────

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation()
    dragging.current = true
    posFromXY(e.touches[0].clientX, e.touches[0].clientY)

    const onMove = (ev: TouchEvent) => {
      ev.preventDefault()  // block scroll while dragging
      if (dragging.current && ev.touches[0]) {
        posFromXY(ev.touches[0].clientX, ev.touches[0].clientY)
      }
    }
    const onEnd = () => { dragging.current = false }

    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend',  onEnd,  { once: true })
  }, [posFromXY])

  // ── Render ─────────────────────────────────────────────────────────────────

  const dominant = getDominantTrait(position)
  const corner   = CORNERS.find(c => c.trait === dominant)!
  const desc     = getDescription(position)

  const dotX = position.x * 100
  const dotY = (1 - position.y) * 100
  const dimOverlay = `radial-gradient(ellipse 48% 48% at ${dotX}% ${dotY}%, transparent 10%, rgba(0,0,0,0.46) 100%)`

  return (
    <div className="quadrant-wrap">
      <div
        ref={ref}
        className="quadrant"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* Axis labels */}
        <span className="q-axis-label q-axis-y-top">理性</span>
        <span className="q-axis-label q-axis-y-bot">感性</span>
        <span className="q-axis-label q-axis-x-left">沉稳</span>
        <span className="q-axis-label q-axis-x-right">激烈</span>

        {/* Corner labels — dim inactive corners */}
        {CORNERS.map(c => (
          <div
            key={c.trait}
            className={`q-corner ${c.cls}`}
            style={{
              color:   c.color,
              opacity: getCornerOpacity(c.cls, position),
            }}
          >
            {c.label}
            <small>{c.sub}</small>
          </div>
        ))}

        {/* Active-region highlight overlay */}
        <div className="q-dim-overlay" style={{ background: dimOverlay }} />

        {/* Dot */}
        <div
          className="q-dot"
          style={{
            left:       `${position.x * 100}%`,
            top:        `${(1 - position.y) * 100}%`,
            background: corner.color,
            boxShadow:  `0 0 14px 5px ${corner.color}55`,
          }}
        />
      </div>

      <div className="q-trait-hint" style={{ color: getIntensity(position) < 0.14 ? 'var(--text-muted)' : corner.color }}>
        {desc}
      </div>
    </div>
  )
}
