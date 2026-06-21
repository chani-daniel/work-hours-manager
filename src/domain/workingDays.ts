// Domain: working-day count and Standard Daily Hours (SPEC §4.5).
// Working days are Sun–Thu; Fri/Sat are the weekend.

// Count Sun–Thu days in a month (month is 1-based, e.g. 6 = June).
export function countWorkingDays(year: number, month: number): number {
  const lastDay = new Date(year, month, 0).getDate()
  let count = 0
  for (let day = 1; day <= lastDay; day++) {
    const weekday = new Date(year, month - 1, day).getDay() // 0=Sun … 6=Sat
    if (weekday <= 4) count++ // Sun–Thu
  }
  return count
}

// Standard Daily Hours = monthly target / working days.
// Returns 0 for a zero/empty target (EC-13) or when there are no working days.
export function computeSDH(monthlyTarget: number, workingDays: number): number {
  if (workingDays <= 0 || monthlyTarget <= 0) return 0
  return monthlyTarget / workingDays
}
