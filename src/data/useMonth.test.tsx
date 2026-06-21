import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'

// Controllable Supabase mock (see useSettings.test.tsx for the pattern).
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

import { useMonth } from './useMonth'

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useMonth', () => {
  it('returns null when the month has no plan yet', async () => {
    h.state.result = { data: null, error: null }
    const { result } = renderHook(() => useMonth(2026, 6), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('returns the month row when one exists', async () => {
    h.state.result = {
      data: {
        id: 'm1',
        user_id: 'u1',
        year: 2026,
        month: 6,
        monthly_target: 180,
        created_at: '2026-06-01T00:00:00Z',
      },
      error: null,
    }
    const { result } = renderHook(() => useMonth(2026, 6), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.monthly_target).toBe(180)
  })
})
