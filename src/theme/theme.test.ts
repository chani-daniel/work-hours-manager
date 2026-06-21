import { describe, it, expect } from 'vitest'
import { theme } from './theme'

describe('theme', () => {
  it('is configured right-to-left for Hebrew', () => {
    expect(theme.direction).toBe('rtl')
  })

  it('uses Heebo as the primary font', () => {
    expect(theme.typography.fontFamily).toContain('Heebo')
  })
})
