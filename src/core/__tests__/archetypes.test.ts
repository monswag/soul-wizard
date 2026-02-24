import { describe, test, expect } from 'vitest'
import { computeArchetype, computeArchetypeFromStyle, ARCHETYPES } from '../archetypes'

describe('computeArchetype', () => {
  // SCORE_MAP:
  //   Q1: [执刃, 向导, 先知, 精灵]
  //   Q2: [先知, 执刃, 向导, 精灵]
  //   Q3: [执刃, 向导, 先知, 精灵]

  test('all-执刃 answers → 执刃', () => {
    expect(computeArchetype([0, 1, 0])).toBe('执刃')
  })

  test('all-向导 answers → 向导', () => {
    expect(computeArchetype([1, 2, 1])).toBe('向导')
  })

  test('all-先知 answers → 先知', () => {
    expect(computeArchetype([2, 0, 2])).toBe('先知')
  })

  test('all-精灵 answers → 精灵', () => {
    expect(computeArchetype([3, 3, 3])).toBe('精灵')
  })

  test('tie broken by priority order 先知 > 向导 > 执刃 > 精灵', () => {
    // Q1→先知(ans=2), Q2→先知(ans=0), Q3→向导(ans=1): 先知×2 向导×1 → 先知
    expect(computeArchetype([2, 0, 1])).toBe('先知')

    // Q1→向导(ans=1), Q2→向导(ans=2), Q3→执刃(ans=0): 向导×2 执刃×1 → 向导
    expect(computeArchetype([1, 2, 0])).toBe('向导')
  })

  test('full tie → first in priority (先知)', () => {
    // Each archetype gets exactly 1 point via mixed answers
    // 先知=1, 向导=1, 执刃=1 → tie → priority picks 先知
    expect(computeArchetype([2, 1, 1])).toBe('先知')
  })

  test('returns a valid ArchetypeKey', () => {
    const valid = Object.keys(ARCHETYPES)
    for (let q1 = 0; q1 < 4; q1++) {
      for (let q2 = 0; q2 < 4; q2++) {
        for (let q3 = 0; q3 < 4; q3++) {
          const result = computeArchetype([q1, q2, q3])
          expect(valid).toContain(result)
        }
      }
    }
  })
})

describe('computeArchetypeFromStyle', () => {
  test('执刃 defaults (advisor+direct+always) → 执刃', () => {
    expect(computeArchetypeFromStyle({ communication: 0, feedback: 0, boundary: 0 })).toBe('执刃')
  })

  test('先知 defaults (advisor+direct+private) → 先知', () => {
    expect(computeArchetypeFromStyle({ communication: 0, feedback: 0, boundary: 1 })).toBe('先知')
  })

  test('向导 defaults (partner+gentle+soft) → 向导', () => {
    expect(computeArchetypeFromStyle({ communication: 1, feedback: 1, boundary: 2 })).toBe('向导')
  })

  test('精灵 defaults (partner+gentle+always) → 精灵', () => {
    expect(computeArchetypeFromStyle({ communication: 1, feedback: 1, boundary: 0 })).toBe('精灵')
  })

  test('精灵 slides boundary to soft → 向导', () => {
    // 精灵 is partner+gentle+always; sliding boundary → soft maps to 向导
    expect(computeArchetypeFromStyle({ communication: 1, feedback: 1, boundary: 2 })).toBe('向导')
  })

  test('continuous values are snapped with Math.round', () => {
    // 0.4 rounds to 0 (advisor), 0.4 rounds to 0 (direct), 0.4 rounds to 0 (always) → 执刃
    expect(computeArchetypeFromStyle({ communication: 0.4, feedback: 0.4, boundary: 0.4 })).toBe('执刃')
    // 0.6 rounds to 1 (partner), 0.6 rounds to 1 (gentle), 1.6 rounds to 2 (soft) → 向导
    expect(computeArchetypeFromStyle({ communication: 0.6, feedback: 0.6, boundary: 1.6 })).toBe('向导')
  })

  test('all 12 discrete combos return a valid ArchetypeKey', () => {
    const valid = Object.keys(ARCHETYPES)
    for (let c = 0; c <= 1; c++) {
      for (let f = 0; f <= 1; f++) {
        for (let b = 0; b <= 2; b++) {
          const result = computeArchetypeFromStyle({ communication: c, feedback: f, boundary: b })
          expect(valid).toContain(result)
        }
      }
    }
  })

  test('balanced 3-3-3-3 distribution across all combos', () => {
    const counts: Record<string, number> = { 先知: 0, 向导: 0, 执刃: 0, 精灵: 0 }
    for (let c = 0; c <= 1; c++) {
      for (let f = 0; f <= 1; f++) {
        for (let b = 0; b <= 2; b++) {
          counts[computeArchetypeFromStyle({ communication: c, feedback: f, boundary: b })]++
        }
      }
    }
    expect(counts['先知']).toBe(3)
    expect(counts['向导']).toBe(3)
    expect(counts['执刃']).toBe(3)
    expect(counts['精灵']).toBe(3)
  })
})

describe('ARCHETYPES data integrity', () => {
  const keys = ['先知', '向导', '执刃', '精灵'] as const

  test.each(keys)('%s has all required fields', key => {
    const a = ARCHETYPES[key]
    expect(a.name).toBeTruthy()
    expect(a.description).toBeTruthy()
    expect(a.tags.length).toBeGreaterThan(0)
    expect(a.defaultChoices.communication).toBeTruthy()
    expect(a.defaultChoices.feedback).toBeTruthy()
    expect(a.colors.accent).toMatch(/^#/)
    expect(a.card.bg).toBeTruthy()
  })
})
