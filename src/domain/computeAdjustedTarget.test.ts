import { describe, it, expect } from 'vitest'
import { computeAdjustedTarget } from './computeAdjustedTarget'

// June 2026 reference dates: 01=Mon, 02=Tue, 03=Wed, 04=Thu (working),
// 05=Fri, 06=Sat (weekend).

describe('computeAdjustedTarget', () => {
  it('leaves the target unchanged when there is no time off', () => {
    expect(computeAdjustedTarget(160, 8, [])).toBe(160)
  })

  it('subtracts one SDH per holiday on a working day', () => {
    expect(
      computeAdjustedTarget(160, 8, [{ date: '2026-06-01', day_type: 'holiday' }]),
    ).toBe(152)
  })

  it('subtracts one SDH per full vacation on a working day', () => {
    const days = [
      { date: '2026-06-01', day_type: 'vacation_full' },
      { date: '2026-06-02', day_type: 'vacation_full' },
    ]
    expect(computeAdjustedTarget(160, 8, days)).toBe(144)
  })

  it('subtracts half an SDH for a half vacation (EC-11)', () => {
    expect(
      computeAdjustedTarget(160, 8, [{ date: '2026-06-01', day_type: 'vacation_half' }]),
    ).toBe(156)
  })

  it('ignores holidays/vacations that fall on a weekend (FR-2.5)', () => {
    const days = [
      { date: '2026-06-05', day_type: 'holiday' }, // Friday
      { date: '2026-06-06', day_type: 'vacation_full' }, // Saturday
    ]
    expect(computeAdjustedTarget(160, 8, days)).toBe(160)
  })

  it('ignores ordinary working/weekend day types', () => {
    const days = [
      { date: '2026-06-01', day_type: 'working' },
      { date: '2026-06-05', day_type: 'weekend' },
    ]
    expect(computeAdjustedTarget(160, 8, days)).toBe(160)
  })

  it('matches the SPEC §4.5 example (target 180, SDH 8.18, 2 full vacations)', () => {
    const sdh = 180 / 22
    const days = [
      { date: '2026-06-01', day_type: 'vacation_full' },
      { date: '2026-06-02', day_type: 'vacation_full' },
    ]
    expect(computeAdjustedTarget(180, sdh, days)).toBeCloseTo(163.64, 2)
  })

  it('never goes below 0 when time off exceeds the target', () => {
    const days = [
      { date: '2026-06-01', day_type: 'vacation_full' },
      { date: '2026-06-02', day_type: 'vacation_full' },
      { date: '2026-06-03', day_type: 'vacation_full' },
      { date: '2026-06-04', day_type: 'vacation_full' },
    ]
    expect(computeAdjustedTarget(10, 8, days)).toBe(0)
  })
})
