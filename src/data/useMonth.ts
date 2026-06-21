import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabaseClient'
import { useAuth } from '../features/auth/AuthProvider'
import type { Month } from './types'

// Read the current user's plan (target) for a specific month.
// RLS scopes rows to the signed-in user; returns null when none exists yet.
export function useMonth(year: number, month: number) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['month', user?.id, year, month],
    enabled: !!user,
    queryFn: async (): Promise<Month | null> => {
      const { data, error } = await supabase
        .from('months')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

// Create or update the target for a month (one row per user per month).
export function useSaveMonthTarget() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      year: number
      month: number
      monthlyTarget: number
    }): Promise<Month> => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('months')
        .upsert(
          {
            user_id: user.id,
            year: vars.year,
            month: vars.month,
            monthly_target: vars.monthlyTarget,
          },
          { onConflict: 'user_id,year,month' },
        )
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ['month', user?.id, vars.year, vars.month],
      })
    },
  })
}
