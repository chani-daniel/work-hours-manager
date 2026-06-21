import { describe, it, expect } from 'vitest'
import { computeNetHours } from './computeNetHours'

describe('computeNetHours — normal cases', () => {
  it('range without overage: 09:00–17:00 = 8', () => {
    expect(computeNetHours({ method: 'range', start: '09:00', end: '17:00' })).toEqual({
      ok: true,
      hours: 8,
    })
  })

  it('range with break overage: 09:00–17:00 − 0.5 = 7.5', () => {
    expect(
      computeNetHours({ method: 'range', start: '09:00', end: '17:00', breakOverage: 0.5 }),
    ).toEqual({ ok: true, hours: 7.5 })
  })

  it('range with minutes: 09:00–12:30 = 3.5', () => {
    expect(computeNetHours({ method: 'range', start: '09:00', end: '12:30' })).toEqual({
      ok: true,
      hours: 3.5,
    })
  })

  it('direct hours pass through: 7.5', () => {
    expect(computeNetHours({ method: 'direct', directHours: 7.5 })).toEqual({
      ok: true,
      hours: 7.5,
    })
  })

  it('no entry = 0 hours', () => {
    expect(computeNetHours({ method: 'none' })).toEqual({ ok: true, hours: 0 })
  })
})

describe('computeNetHours — EC-1 (end before/equal start)', () => {
  it('end before start is an error', () => {
    expect(computeNetHours({ method: 'range', start: '17:00', end: '09:00' })).toEqual({
      ok: false,
      error: 'end_before_start',
    })
  })

  it('end equal to start is an error', () => {
    expect(computeNetHours({ method: 'range', start: '09:00', end: '09:00' })).toEqual({
      ok: false,
      error: 'end_before_start',
    })
  })
})

describe('computeNetHours — EC-2 (overage vs duration)', () => {
  it('overage greater than duration is an error', () => {
    expect(
      computeNetHours({ method: 'range', start: '09:00', end: '10:00', breakOverage: 2 }),
    ).toEqual({ ok: false, error: 'overage_exceeds_duration' })
  })

  it('overage equal to duration yields 0 (boundary, allowed)', () => {
    expect(
      computeNetHours({ method: 'range', start: '09:00', end: '10:00', breakOverage: 1 }),
    ).toEqual({ ok: true, hours: 0 })
  })
})

describe('computeNetHours — EC-4 (invalid direct hours)', () => {
  it('zero is invalid', () => {
    expect(computeNetHours({ method: 'direct', directHours: 0 })).toEqual({
      ok: false,
      error: 'invalid_direct_hours',
    })
  })

  it('negative is invalid', () => {
    expect(computeNetHours({ method: 'direct', directHours: -3 })).toEqual({
      ok: false,
      error: 'invalid_direct_hours',
    })
  })

  it('more than 24 is invalid', () => {
    expect(computeNetHours({ method: 'direct', directHours: 25 })).toEqual({
      ok: false,
      error: 'invalid_direct_hours',
    })
  })

  it('exactly 24 is valid (boundary)', () => {
    expect(computeNetHours({ method: 'direct', directHours: 24 })).toEqual({
      ok: true,
      hours: 24,
    })
  })
})
