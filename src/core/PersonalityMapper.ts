import type { Personality, PersonalityTrait, OrbParams, StyleChoices } from './types'
import type { QuadrantPosition } from '../ui/QuadrantSelector'

// ─── Base presets ─────────────────────────────────────────────────────────────
// chaos: 0=smooth  1=sharp     (maps to quadrant x)
// flow:  0=loose   1=tight     (maps to quadrant y)

const TRAIT_PRESETS: Record<PersonalityTrait, OrbParams> = {
  果决: {
    primaryColor:   [1.0, 0.27, 0.27],
    secondaryColor: [1.0, 0.55, 0.0],
    particleEffect: 'spark',
    pulseFrequency: 2.0,
    amplitude:      0.85,
    turbulence:     0.9,
    clarity:        0,
    chaos:          0.85,
    flow:           0.80,
  },
  温柔: {
    primaryColor:   [0.27, 0.67, 1.0],
    secondaryColor: [0.27, 0.87, 0.73],
    particleEffect: 'wave',
    pulseFrequency: 0.5,
    amplitude:      0.4,
    turbulence:     0.15,
    clarity:        0,
    chaos:          0.08,
    flow:           0.18,
  },
  冷静: {
    primaryColor:   [0.6,  0.4,  1.0],
    secondaryColor: [0.75, 0.75, 0.9],
    particleEffect: 'stardust',
    pulseFrequency: 1.0,
    amplitude:      0.5,
    turbulence:     0.25,
    clarity:        0,
    chaos:          0.10,
    flow:           0.85,
  },
  活泼: {
    primaryColor:   [1.0,  0.8,  0.27],
    secondaryColor: [1.0,  0.45, 0.65],
    particleEffect: 'bubble',
    pulseFrequency: 1.5,
    amplitude:      0.7,
    turbulence:     0.55,
    clarity:        0,
    chaos:          0.72,
    flow:           0.20,
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

function bilinearColor(
  bl: [number, number, number],
  br: [number, number, number],
  tl: [number, number, number],
  tr: [number, number, number],
  x: number, y: number,
): [number, number, number] {
  return lerpColor(lerpColor(bl, br, x), lerpColor(tl, tr, x), y)
}

// ─── Quadrant → OrbParams (bilinear across all 4 corners) ────────────────────

export function quadrantToOrb(pos: QuadrantPosition, clarity: number): OrbParams {
  const { x, y } = pos

  // Corners: bl=温柔(0,0)  br=活泼(1,0)  tl=冷静(0,1)  tr=果决(1,1)
  const bl = TRAIT_PRESETS['温柔']
  const br = TRAIT_PRESETS['活泼']
  const tl = TRAIT_PRESETS['冷静']
  const tr = TRAIT_PRESETS['果决']

  const primaryColor   = bilinearColor(bl.primaryColor,   br.primaryColor,   tl.primaryColor,   tr.primaryColor,   x, y)
  const secondaryColor = bilinearColor(bl.secondaryColor, br.secondaryColor, tl.secondaryColor, tr.secondaryColor, x, y)

  const dx = x - 0.5
  const dy = y - 0.5
  const intensity = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2 * Math.SQRT2)

  return {
    primaryColor,
    secondaryColor,
    particleEffect: 'stardust',
    pulseFrequency: lerp(0.5, 2.0, x),
    amplitude:      lerp(0.3, 0.9, intensity),
    turbulence:     lerp(0.1, 0.9, x * 0.6 + y * 0.4),
    clarity,
    chaos: x,           // left=smooth  right=sharp
    flow:  y,           // bottom=loose top=tight
  }
}

// ─── Legacy (still used for file generation fallback) ────────────────────────

export function personalityToOrb(p: Personality, clarity = 0): OrbParams {
  const base = { ...TRAIT_PRESETS[p.trait] }
  if (p.secondaryTrait) {
    const s = TRAIT_PRESETS[p.secondaryTrait]
    base.primaryColor   = lerpColor(base.primaryColor,   s.primaryColor,   0.2)
    base.secondaryColor = lerpColor(base.secondaryColor, s.secondaryColor, 0.2)
    base.turbulence     = lerp(base.turbulence, s.turbulence, 0.2)
    base.chaos          = lerp(base.chaos, s.chaos, 0.2)
    base.flow           = lerp(base.flow,  s.flow,  0.2)
  }
  base.amplitude  = base.amplitude  * (0.5 + p.intensity * 0.5)
  base.turbulence = base.turbulence * (0.3 + p.intensity * 0.7)
  base.clarity    = clarity
  return base
}

// ─── StyleChoices → QuadrantPosition ─────────────────────────────────────────

export function choicesToQuadrant(choices: StyleChoices): QuadrantPosition {
  let x = 0.5  // chaos axis: direct/active → higher
  let y = 0.5  // rational axis: advisor/structured → higher

  if (choices.communication === 'advisor') y = Math.min(0.95, y + 0.35)
  if (choices.communication === 'partner') y = Math.max(0.05, y - 0.30)
  if (choices.feedback === 'direct') x = Math.min(0.95, x + 0.30)
  if (choices.feedback === 'gentle') x = Math.max(0.05, x - 0.25)
  if (choices.output === 'overview') x = Math.min(0.95, x + 0.10)
  if (choices.output === 'stepwise') y = Math.min(0.95, y + 0.10)
  return { x, y }
}

export function textToOrbNudge(text: string, base: OrbParams): Partial<OrbParams> {
  const energy = Math.min(text.length, 200) / 200
  return {
    amplitude:  Math.min(1, base.amplitude + energy * 0.08),
    turbulence: Math.min(1, base.turbulence + energy * 0.04),
  }
}

export { TRAIT_PRESETS }
