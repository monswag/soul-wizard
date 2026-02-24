import { describe, test, expect } from 'vitest'
import { generateFiles } from '../FileGenerator'
import type { AgentIdentity, UserProfile } from '../types'

const agent: AgentIdentity = {
  name: 'TestBot',
  beingType: 'AI',
  temperament: '沉稳',
  emoji: '🔮',
  personality: { trait: '冷静', intensity: 0.7 },
  customTraits: [],
}

const user: UserProfile = {
  name: '小明',
  callMe: '小明',
  pronouns: '他/他',
  timezone: 'Asia/Shanghai',
  notes: '',
}

describe('generateFiles', () => {
  test('returns all four file keys', () => {
    const files = generateFiles(agent, user)
    expect(files).toHaveProperty('identityMd')
    expect(files).toHaveProperty('soulMd')
    expect(files).toHaveProperty('userMd')
    expect(files).toHaveProperty('imagePrompt')
  })

  test('identityMd contains agent name and emoji', () => {
    const { identityMd } = generateFiles(agent, user)
    expect(identityMd).toContain('TestBot')
    expect(identityMd).toContain('🔮')
  })

  test('soulMd contains agent name and trait content', () => {
    const { soulMd } = generateFiles(agent, user)
    expect(soulMd).toContain('TestBot')
    expect(soulMd).toContain('冷静')
    // personality intensity: 70%
    expect(soulMd).toContain('70%')
  })

  test('userMd contains user name and timezone', () => {
    const { userMd } = generateFiles(agent, user)
    expect(userMd).toContain('小明')
    expect(userMd).toContain('Asia/Shanghai')
  })

  test('imagePrompt contains agent name and trait visual', () => {
    const { imagePrompt } = generateFiles(agent, user)
    expect(imagePrompt).toContain('TestBot')
    expect(imagePrompt).toContain('purple-silver') // 冷静 trait
  })

  test('soulMd and userMd include generated_by header', () => {
    const { soulMd, userMd } = generateFiles(agent, user)
    for (const md of [soulMd, userMd]) {
      expect(md).toContain('generated_by: soul-wizard')
    }
  })

  test('identityMd uses openclaw key-value format', () => {
    const { identityMd } = generateFiles(agent, user)
    expect(identityMd).toMatch(/^name: TestBot/)
    expect(identityMd).toContain('creature: AI')
    expect(identityMd).toContain('vibe: 沉稳')
    expect(identityMd).toContain('emoji: 🔮')
    expect(identityMd).toContain('avatar:')
  })

  test('soulMd contains output style when choices provided', () => {
    const { soulMd: overview } = generateFiles(agent, user, { output: 'overview' })
    expect(overview).toContain('总览式')

    const { soulMd: stepwise } = generateFiles(agent, user, { output: 'stepwise' })
    expect(stepwise).toContain('逐步式')

    const { soulMd: noOutput } = generateFiles(agent, user)
    expect(noOutput).not.toContain('偏好输出方式')
  })

  test('custom traits appear in soulMd', () => {
    const agentWithTraits: AgentIdentity = {
      ...agent,
      customTraits: ['诗意', '严谨'],
    }
    const { soulMd } = generateFiles(agentWithTraits, user)
    expect(soulMd).toContain('诗意')
    expect(soulMd).toContain('严谨')
  })
})
