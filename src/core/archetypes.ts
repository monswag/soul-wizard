import type { PersonalityTrait, StyleChoices } from './types'

export type ArchetypeKey = '先知' | '向导' | '执刃' | '精灵'

export interface Archetype {
  key:         ArchetypeKey
  name:        string
  trait:       PersonalityTrait
  subtitle:    string
  description: string
  tags:        string[]
  image:       string
  // Optional variant images shown when sliders hit thresholds.
  // Add partner/gentle paths here to enable switching in StepReveal.
  imageVariants?: {
    partner?: string   // communication → partner end
    gentle?:  string   // feedback → gentle end
  }
  symbol:      string
  defaultChoices: StyleChoices
  colors: {
    accent:  string                     // CSS variable --accent: primary button, active states
    pageBg:  string                     // subtle page tint when this archetype is active
    sliders: [string, string, string]   // per-slider colors: [communication, feedback, boundary]
  }
  card: {
    bg:     string   // card gradient background
    text:   string   // text on card
    border: string   // card border
    glow:   string   // card reveal glow (rgba)
  }
}

export const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  先知: {
    key:         '先知',
    name:        '先知',
    trait:       '冷静',
    subtitle:    'The Oracle',
    description: '在开口之前已想清楚。沉稳的观察者，在混乱中是你的定点。',
    tags:        ['客观', '精准', '战略'],
    image:       '/archetypes/seer.png',
    symbol:      '🔮',
    defaultChoices: {
      communication: 'advisor',
      feedback:      'direct',
      output:        'overview',
      boundary:      'private',
    },
    colors: {
      accent:  '#9b7fd4',
      pageBg:  '#f5f2fc',
      sliders: ['#9b7fd4', '#7f9bd4', '#d47f9b'],  // purple → blue-purple → pink-purple
    },
    card: {
      bg:     'linear-gradient(160deg, #ede6fa 0%, #cdbef0 100%)',
      text:   '#1e1530',
      border: 'rgba(155, 127, 212, 0.30)',
      glow:   'rgba(155, 127, 212, 0.45)',
    },
  },

  向导: {
    key:         '向导',
    name:        '向导',
    trait:       '温柔',
    subtitle:    'The Guide',
    description: '总是先听，再说。先理解，再帮。你不是一个人在走。',
    tags:        ['温暖', '耐心', '同在'],
    image:       '/archetypes/guide.png',
    symbol:      '🌿',
    defaultChoices: {
      communication: 'partner',
      feedback:      'gentle',
      output:        'stepwise',
      boundary:      'soft',
    },
    colors: {
      accent:  '#3aada6',
      pageBg:  '#f0faf8',
      sliders: ['#3aada6', '#3a7aad', '#3aad72'],  // teal → blue-teal → green-teal
    },
    card: {
      bg:     'linear-gradient(160deg, #d8f2ee 0%, #98d8d4 100%)',
      text:   '#0c2e2a',
      border: 'rgba(58, 173, 166, 0.30)',
      glow:   'rgba(58, 173, 166, 0.45)',
    },
  },

  执刃: {
    key:         '执刃',
    name:        '执刃',
    trait:       '果决',
    subtitle:    'The Blade',
    description: '不打转，不拖延。直接帮你动起来，说到做到。',
    tags:        ['直接', '高效', '果断'],
    image:       '/archetypes/blade.png',
    symbol:      '⚡',
    defaultChoices: {
      communication: 'advisor',
      feedback:      'direct',
      output:        'stepwise',
      boundary:      'always',
    },
    colors: {
      accent:  '#e05c1a',
      pageBg:  '#fdf5ef',
      sliders: ['#e05c1a', '#e0a01a', '#c01a3a'],  // orange → amber → red
    },
    card: {
      bg:     'linear-gradient(160deg, #fde8d0 0%, #f0a060 100%)',
      text:   '#280e02',
      border: 'rgba(224, 92, 26, 0.30)',
      glow:   'rgba(224, 92, 26, 0.45)',
    },
  },

  精灵: {
    key:         '精灵',
    name:        '精灵',
    trait:       '活泼',
    subtitle:    'The Spark',
    description: '能跟你一起乱想，把死路变成新路，把无聊变得有趣。',
    tags:        ['好奇', '跳跃', '有趣'],
    image:       '/archetypes/spark.png',
    symbol:      '✨',
    defaultChoices: {
      communication: 'partner',
      feedback:      'gentle',
      output:        'overview',
      boundary:      'always',
    },
    colors: {
      accent:  '#c49800',
      pageBg:  '#fffbea',
      sliders: ['#c49800', '#8ab000', '#c46400'],  // gold → lime → dark amber
    },
    card: {
      bg:     'linear-gradient(160deg, #fef5cc 0%, #f8dc40 100%)',
      text:   '#281c02',
      border: 'rgba(196, 152, 0, 0.30)',
      glow:   'rgba(196, 152, 0, 0.45)',
    },
  },
}

// ── Quiz scoring ───────────────────────────────────────────────────────────────
const SCORE_MAP: ArchetypeKey[][] = [
  ['执刃', '向导', '先知', '精灵'],   // Q1: 你希望我怎么和你说话？
  ['先知', '执刃', '向导', '精灵'],   // Q2: 哪种帮助最对你的胃口？
  ['执刃', '向导', '先知', '精灵'],   // Q3: 你希望我在你的日常里怎么存在？
]

// ── Style-based archetype lookup ───────────────────────────────────────────────
// Maps continuous slider values (snapped to discrete) to an archetype.
// Balanced 3-3-3-3: each archetype owns exactly 3 of the 12 discrete combos.
//   执刃 = "always" boundary (upfront/direct mindset)
//   先知 = advisor mode + measured (non-soft)
//   向导 = "soft" boundary (careful/considerate)
//   精灵 = partner mode + non-soft (spontaneous/open)
export function computeArchetypeFromStyle(sliderVals: {
  communication: number  // continuous [0, 1]
  feedback:      number  // continuous [0, 1]
  boundary:      number  // continuous [0, 2]
}): ArchetypeKey {
  const c = Math.round(sliderVals.communication)  // 0=advisor  1=partner
  const f = Math.round(sliderVals.feedback)       // 0=direct   1=gentle
  const b = Math.round(sliderVals.boundary)       // 0=always   1=private  2=soft
  const TABLE: Record<string, ArchetypeKey> = {
    '0-0-0': '执刃', '0-0-1': '先知', '0-0-2': '先知',
    '0-1-0': '执刃', '0-1-1': '先知', '0-1-2': '向导',
    '1-0-0': '执刃', '1-0-1': '精灵', '1-0-2': '向导',
    '1-1-0': '精灵', '1-1-1': '精灵', '1-1-2': '向导',
  }
  return TABLE[`${c}-${f}-${b}`] ?? '先知'
}

export function computeArchetype(answers: number[]): ArchetypeKey {
  const scores: Record<ArchetypeKey, number> = { 先知: 0, 向导: 0, 执刃: 0, 精灵: 0 }
  answers.forEach((ans, qi) => {
    const key = SCORE_MAP[qi]?.[ans]
    if (key) scores[key]++
  })
  const priority: ArchetypeKey[] = ['先知', '向导', '执刃', '精灵']
  const max = Math.max(...Object.values(scores))
  return priority.find(k => scores[k] === max)!
}
