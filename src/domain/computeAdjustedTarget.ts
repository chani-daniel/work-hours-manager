// Domain: reduce the monthly target for holidays and vacations (SPEC §4.5).
// adjustedTarget = monthlyTarget − (SDH × Σ day factors). Pure function.

// The app has no built-in holiday calendar; day types are marked by the user.
const TIME_OFF = new Set(['holiday', 'vacation_full', 'vacation_half'])

// Minimal day shape this function needs (decoupled from the DB row type).
export type AdjustmentDay = { date: string; day_type: string }

// True for Friday/Saturday. Parse parts manually to avoid UTC date shifts.
function isWeekend(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number)
  const weekday = new Date(y, m - 1, d).getDay() // 0=Sun … 6=Sat
  return weekday === 5 || weekday === 6
}

// Reduction factor for one day (FR-5.2):
// holiday / full vacation on a working day = 1, half vacation = 0.5,
// anything on a weekend or any non-time-off type = 0.
function dayFactor(record: AdjustmentDay): number {
  if (!TIME_OFF.has(record.day_type)) return 0
  if (isWeekend(record.date)) return 0 // FR-2.5
  return record.day_type === 'vacation_half' ? 0.5 : 1
}

export function computeAdjustedTarget(
  monthlyTarget: number,
  sdh: number,
  dayRecords: AdjustmentDay[],
): number {
  const factorSum = dayRecords.reduce((sum, r) => sum + dayFactor(r), 0)
  const adjusted = monthlyTarget - sdh * factorSum
  return adjusted < 0 ? 0 : adjusted
}
