// ─── Personality ────────────────────────────────────────────────────────────

export type PersonalityTrait = '果决' | '温柔' | '冷静' | '活泼'

export type BeingType = 'AI' | '使魔' | '幽灵' | '机器人' | '神谕'

export interface Personality {
  trait: PersonalityTrait
  intensity: number // 0–1
  secondaryTrait?: PersonalityTrait
}

// ─── Orb Visual Parameters ──────────────────────────────────────────────────

export interface OrbParams {
  primaryColor: [number, number, number]   // RGB 0–1
  secondaryColor: [number, number, number]
  particleEffect: 'spark' | 'wave' | 'stardust' | 'bubble'
  pulseFrequency: number   // Hz
  amplitude: number        // 0–1
  turbulence: number       // 0–1
  clarity: number          // 0–1  grows as form is filled
  chaos: number            // 0=smooth/orbital  1=sharp/scattered  (x axis)
  flow: number             // 0=loose/free      1=tight/structured  (y axis)
}

// ─── Session State ───────────────────────────────────────────────────────────

export interface AgentIdentity {
  name: string
  beingType: string  // BeingType preset or custom string
  temperament: string
  emoji: string
  personality: Personality
  customTraits: string[]
}

export interface UserProfile {
  name: string
  callMe: string
  pronouns: string
  timezone: string
  notes: string
}

export interface SessionData {
  agent: AgentIdentity
  user: UserProfile
  step: number
  completeness: number
}

// ─── Generated Output ────────────────────────────────────────────────────────

export interface GeneratedFiles {
  identityMd: string
  soulMd: string
  userMd: string
  imagePrompt: string
}

// ─── Style Choices (binary personality questions) ────────────────────────────

export type CommunicationStyle = 'advisor' | 'partner'
export type FeedbackStyle      = 'direct'  | 'gentle'
export type OutputStyle        = 'stepwise' | 'overview'
export type BoundaryChoice     = 'always'  | 'private' | 'soft'

export interface StyleChoices {
  communication: CommunicationStyle | null
  feedback:      FeedbackStyle      | null
  output:        OutputStyle        | null
  boundary:      BoundaryChoice     | null
}
