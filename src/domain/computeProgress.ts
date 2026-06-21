// Domain: progress & pace for the current month (SPEC §4.6). Pure function.

// Minimal day shape this function needs (decoupled from the DB row type).
export type ProgressDay = { date: string; day_type: string; net_hours: number }

export type Progress = {
  hoursWorked: number
  hoursRemaining: number
  remainingAvailableDays: number
  // null when there are no remaining available days (EC-7: pace undefined).
  requiredPace: number | null
}

const pad = (n: number) => String(n).padStart(2, '0')

export function computeProgress(
  adjustedTarget: number,
  dayRecords: ProgressDay[],
  today: Date,
): Progress {
  // FR-6.1: every record's net hours count, including weekend work (EC-9).
  const hoursWorked = dayRecords.reduce((sum, r) => sum + (r.net_hours ?? 0), 0)
  // FR-6.2: may be negative when above target.
  const hoursRemaining = adjustedTarget - hoursWorked

  const byDate = new Map(dayRecords.map((r) => [r.date, r]))
  const year = today.getFullYear()
  const month0 = today.getMonth() // 0-based
  const lastDay = new Date(year, month0 + 1, 0).getDate()

  // FR-6.3: available days (Sun–Thu, not holiday/vacation) from today to
  // month-end that have no record. A half vacation counts as 0.5.
  let remainingAvailableDays = 0
  for (let day = today.getDate(); day <= lastDay; day++) {
    const weekday = new Date(year, month0, day).getDay()
    if (weekday === 5 || weekday === 6) continue // weekend: never available
    const record = byDate.get(`${year}-${pad(month0 + 1)}-${pad(day)}`)
    if (!record) {
      remainingAvailableDays += 1
    } else if (record.day_type === 'vacation_half') {
      remainingAvailableDays += 0.5
    }
    // holiday / full vacation / a day that already has a record → 0
  }

  // FR-6.4: pace to meet the target across the remaining days. Undefined when
  // none remain (EC-7). Clamped to 0 once already at/above target.
  const requiredPace =
    remainingAvailableDays > 0
      ? Math.max(0, hoursRemaining) / remainingAvailableDays
      : null

  return { hoursWorked, hoursRemaining, remainingAvailableDays, requiredPace }
}
