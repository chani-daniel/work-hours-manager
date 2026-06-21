import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'

// Controllable Supabase mock. vi.hoisted runs before vi.mock, so the builder
// exists when the mock factory references it. Tests set `state.result`.
const h = vi.hoisted(() => {
  const state: { result: { data: unknown; error: unknown } } = {
    result: { data: null, error: null },
  }
  const builder = {
    select: () => builder,
    eq: () => builder,
    upsert: () => builder,
    single: () => Promise.resolve(state.result),
    maybeSingle: () => Promise.resolve(state.result),
  }
  return { state, supabase: { from: () => builder } }
})

vi.mock('./supabaseClient', () => ({ supabase: h.supabase }))
vi.mock('../features/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}))

import { useSettings, withSettingsDefaults } from './useSettings'
import { DEFAULT_SETTINGS } from './types'

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('withSettingsDefaults', () => {
  it('returns the defaults when there is no row', () => {
    expect(withSettingsDefaults(null)).toEqual(DEFAULT_SETTINGS)
  })

  it('returns the row values when a row exists', () => {
    const row = {
      user_id: 'u1',
      max_daily_hours: 10,
      max_consecutive_days: 5,
      lag_factor: 1.5,
      green_factor: 1,
      yellow_factor: 0.8,
    }
    expect(withSettingsDefaults(row)).toEqual({
      max_daily_hours: 10,
      max_consecutive_days: 5,
      lag_factor: 1.5,
      green_factor: 1,
      yellow_factor: 0.8,
    })
  })
})

describe('useSettings', () => {
  it('falls back to defaults when the user has no settings row', async () => {
    h.state.result = { data: null, error: null }
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(DEFAULT_SETTINGS)
  })

  it('returns the stored settings when a row exists', async () => {
    h.state.result = {
      data: {
        user_id: 'u1',
        max_daily_hours: 8,
        max_consecutive_days: 6,
        lag_factor: 1.25,
        green_factor: 1,
        yellow_factor: 0.75,
      },
      error: null,
    }
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.max_daily_hours).toBe(8)
  })
})
