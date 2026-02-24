import { describe, test, expect } from 'vitest'
import { matchCityTz } from '../cityTimezones'

describe('matchCityTz', () => {
  test('exact Chinese city name', () => {
    expect(matchCityTz('北京')).toBe('Asia/Shanghai')
    expect(matchCityTz('香港')).toBe('Asia/Hong_Kong')
    expect(matchCityTz('东京')).toBe('Asia/Tokyo')
  })

  test('exact English city name', () => {
    expect(matchCityTz('London')).toBe('Europe/London')
    expect(matchCityTz('New York')).toBe('America/New_York')
    expect(matchCityTz('Tokyo')).toBe('Asia/Tokyo')
  })

  test('prefix match (case insensitive)', () => {
    expect(matchCityTz('lon')).toBe('Europe/London')
    expect(matchCityTz('LON')).toBe('Europe/London')
    expect(matchCityTz('sha')).toBe('Asia/Shanghai')
    expect(matchCityTz('新')).toBe('Asia/Singapore') // 新加坡
  })

  test('empty string returns null', () => {
    expect(matchCityTz('')).toBeNull()
    expect(matchCityTz('   ')).toBeNull()
  })

  test('no match returns null', () => {
    expect(matchCityTz('zzz_no_match')).toBeNull()
    expect(matchCityTz('xyz')).toBeNull()
  })
})
