// Database row shapes (mirror supabase/schema.sql).

export type Month = {
  id: string
  user_id: string
  year: number
  month: number
  monthly_target: number
  created_at: string
}

// Per-user threshold values (without the user_id key).
export type SettingsValues = {
  max_daily_hours: number
  max_consecutive_days: number
  lag_factor: number
  green_factor: number
  yellow_factor: number
}

export type Settings = SettingsValues & { user_id: string }

// Defaults from PLAN §3.3, used until the user has a settings row.
export const DEFAULT_SETTINGS: SettingsValues = {
  max_daily_hours: 12,
  max_consecutive_days: 6,
  lag_factor: 1.25,
  green_factor: 1.0,
  yellow_factor: 0.75,
}
