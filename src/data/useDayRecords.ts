import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabaseClient'
import { useAuth } from '../features/auth/AuthProvider'
import type { DayRecord, DayRecordInput } from './types'

// First/last calendar day of a month as 'YYYY-MM-DD' strings.
// new Date(year, month, 0) is the last day of `month` (month is 1-based here).
export function monthRange(year: number, month: number) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  return {
    start: `${year}-${pad(month)}-01`,
    end: `${year}-${pad(month)}-${pad(lastDay)}`,
  }
}

// List the current user's day records for a given month (RLS-scoped).
export function useDayRecords(year: number, month: number) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['day_records', user?.id, year, month],
    enabled: !!user,
    queryFn: async (): Promise<DayRecord[]> => {
      const { start, end } = monthRange(year, month)
      const { data, error } = await supabase
        .from('day_records')
        .select('*')
        .gte('date', start)
        .lte('date', end)
        .order('date')
      if (error) throw error
      return data ?? []
    },
  })
}

// Create or update a single day's record (one row per day, EC-3).
export function useUpsertDayRecord() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (record: DayRecordInput): Promise<DayRecord> => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('day_records')
        .upsert({ user_id: user.id, ...record }, { onConflict: 'user_id,date' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Refresh every cached month for this user (the new/edited day may
      // belong to any of them).
      qc.invalidateQueries({ queryKey: ['day_records', user?.id] })
    },
  })
}
