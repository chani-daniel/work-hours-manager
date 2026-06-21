import { describe, it, expect } from 'vitest'
import { computeProgress } from './computeProgress'

// Reference "today" = Monday 2026-06-15. The working days (Sun–Thu) from the
// 15th to the 30th are: 15,16,17,18, 21,22,23,24,25, 28,29,30 = 12 days.
const TODAY = new Date(2026, 5, 15)

describe('computeProgress', () => {
  it('with no records: all target remains and every working day is available', () => {
    const p = computeProgress(100, [], TODAY)
    expect(p.hoursWorked).toBe(0)
    expect(p.hoursRemaining).toBe(100)
    expect(p.remainingAvailableDays).toBe(12)
    expect(p.requiredPace).toBeCloseTo(100 / 12, 4)
  })

  it('sums worked hours, counting weekend work too (EC-9)', () => {
    const records = [
      { date: '2026-06-01', day_type: 'working', net_hours: 8 },
      { date: '2026-06-06', day_type: 'weekend', net_hours: 5 }, // Saturday
    ]
    const p = computeProgress(100, records, TODAY)
    expect(p.hoursWorked).toBe(13)
    expect(p.hoursRemaining).toBe(87)
    // Both records are before today, so they don't change remaining days.
    expect(p.remainingAvailableDays).toBe(12)
  })

  it('a future full vacation removes an available day', () => {
    const records = [{ date: '2026-06-22', day_type: 'vacation_full', net_hours: 0 }]
    const p = computeProgress(100, records, TODAY)
    expect(p.remainingAvailableDays).toBe(11)
  })

  it('a future half vacation counts as half an available day (EC-11)', () => {
    const records = [{ date: '2026-06-22', day_type: 'vacation_half', net_hours: 0 }]
    const p = computeProgress(100, records, TODAY)
    expect(p.remainingAvailableDays).toBe(11.5)
  })

  it('a future working day that already has a record is no longer "remaining"', () => {
    const records = [{ date: '2026-06-22', day_type: 'working', net_hours: 8 }]
    const p = computeProgress(100, records, TODAY)
    expect(p.hoursWorked).toBe(8)
    expect(p.remainingAvailableDays).toBe(11)
  })

  it('required pace is null when no available days remain but hours remain (EC-7)', () => {
    const lastDay = new Date(2026, 5, 30) // Tuesday 2026-06-30
    const records = [{ date: '2026-06-30', day_type: 'working', net_hours: 5 }]
    const p = computeProgress(100, records, lastDay)
    expect(p.remainingAvailableDays).toBe(0)
    expect(p.hoursRemaining).toBe(95)
    expect(p.requiredPace).toBeNull()
  })

  it('hours remaining go negative above target, and pace clamps to 0', () => {
    const records = [{ date: '2026-06-01', day_type: 'working', net_hours: 20 }]
    const p = computeProgress(10, records, TODAY)
    expect(p.hoursRemaining).toBe(-10)
    expect(p.requiredPace).toBe(0)
  })
})
