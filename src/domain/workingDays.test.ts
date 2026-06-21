import { describe, it, expect } from 'vitest'
import { countWorkingDays, computeSDH } from './workingDays'

describe('countWorkingDays', () => {
  it('counts Sun–Thu days across several months', () => {
    expect(countWorkingDays(2026, 6)).toBe(22) // June 2026, 30 days
    expect(countWorkingDays(2026, 1)).toBe(21) // January 2026, 31 days
    expect(countWorkingDays(2026, 2)).toBe(20) // February 2026, 28 days
  })

  it('handles a leap-year February', () => {
    expect(countWorkingDays(2024, 2)).toBe(21) // February 2024, 29 days
  })

  it('working days + weekend days always equal the month length', () => {
    for (const [year, month, days] of [
      [2026, 6, 30],
      [2024, 2, 29],
      [2026, 2, 28],
      [2026, 1, 31],
    ] as const) {
      const working = countWorkingDays(year, month)
      const weekend = days - working
      expect(working + weekend).toBe(days)
    }
  })
})

describe('computeSDH', () => {
  it('divides the target by the working days', () => {
    expect(computeSDH(160, 20)).toBe(8)
    expect(computeSDH(180, 22)).toBeCloseTo(8.1818, 3)
  })

  it('returns 0 for a zero/empty target (EC-13)', () => {
    expect(computeSDH(0, 22)).toBe(0)
  })

  it('returns 0 when there are no working days (no division by zero)', () => {
    expect(computeSDH(100, 0)).toBe(0)
  })
})
