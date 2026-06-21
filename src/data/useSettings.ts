import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabaseClient'
import { useAuth } from '../features/auth/AuthProvider'
import { DEFAULT_SETTINGS } from './types'
import type { Settings, SettingsValues } from './types'

// Merge a settings row (or null) with the defaults, returning plain values.
export function withSettingsDefaults(row: Settings | null): SettingsValues {
  if (!row) return DEFAULT_SETTINGS
  return {
    max_daily_hours: row.max_daily_hours,
    max_consecutive_days: row.max_consecutive_days,
    lag_factor: row.lag_factor,
    green_factor: row.green_factor,
    yellow_factor: row.yellow_factor,
  }
}

// Read the current user's settings, falling back to defaults when no row exists.
export function useSettings() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['settings', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SettingsValues> => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .maybeSingle()
      if (error) throw error
      return withSettingsDefaults(data)
    },
  })
}

// Create or update the current user's settings (one row per user).
export function useUpdateSettings() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: SettingsValues): Promise<Settings> => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('settings')
        .upsert({ user_id: user.id, ...values }, { onConflict: 'user_id' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings', user?.id] })
    },
  })
}
