// Domain: compute a day's net work hours from its entry (SPEC §4.3–§4.4).
// Pure function — no I/O, no framework. Errors are returned, not thrown.

export type NetHoursError =
  | 'end_before_start' // EC-1
  | 'overage_exceeds_duration' // EC-2
  | 'invalid_direct_hours' // EC-4

export type NetHoursResult =
  | { ok: true; hours: number }
  | { ok: false; error: NetHoursError }

export type NetHoursInput =
  | { method: 'none' }
  | { method: 'range'; start: string; end: string; breakOverage?: number }
  | { method: 'direct'; directHours: number; breakOverage?: number }

// Parse 'HH:MM' or 'HH:MM:SS' into decimal hours (e.g. '09:30' -> 9.5).
function parseTimeToHours(time: string): number {
  const [h, m = '0'] = time.split(':')
  return Number(h) + Number(m) / 60
}

export function computeNetHours(input: NetHoursInput): NetHoursResult {
  if (input.method === 'none') {
    return { ok: true, hours: 0 }
  }

  if (input.method === 'direct') {
    const { directHours } = input
    // EC-4: direct hours must be a real number, > 0 and <= 24.
    if (!Number.isFinite(directHours) || directHours <= 0 || directHours > 24) {
      return { ok: false, error: 'invalid_direct_hours' }
    }
    // Direct entry is already net (break overage is optional and not applied).
    return { ok: true, hours: directHours }
  }

  // Range method: net = (end - start) - break overage.
  const duration = parseTimeToHours(input.end) - parseTimeToHours(input.start)
  // EC-1: end must be after start; midnight-crossing shifts are unsupported.
  if (!Number.isFinite(duration) || duration <= 0) {
    return { ok: false, error: 'end_before_start' }
  }

  const net = duration - (input.breakOverage ?? 0)
  // EC-2: net hours never drop below 0.
  if (net < 0) {
    return { ok: false, error: 'overage_exceeds_duration' }
  }

  return { ok: true, hours: net }
}
