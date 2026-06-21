import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'

// Controllable Supabase mock. The builder is a thenable so `await query`
// (a list query that ends in .order()) resolves to state.result.
const h = vi.hoisted(() => {
  const state: { result: { data: unknown; error: unknown } } = {
    result: { data: [], error: null },
  }
  const builder = {
    select: () => builder,
    eq: () => builder,
    gte: () => builder,
    lte: () => builder,
    order: () => builder,
    upsert: () => builder,
    single: () => Promise.resolve(state.result),
    maybeSingle: () => Promise.resolve(state.result),
    then: (onF: (v: unknown) => unknown, onR?: (e: unknown) => unknown) =>
      Promise.resolve(state.result).then(onF, onR),
  }
  return { state, supabase: { from: () => builder } }
})

vi.mock('./supabaseClient', () => ({ supabase: h.supabase }))
vi.mock('../features/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}))

import { useDayRecords, monthRange } from './useDayRecords'

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('monthRange', () => {
  it('spans the whole month', () => {
    expect(monthRange(2026, 6)).toEqual({ start: '2026-06-01', end: '2026-06-30' })
  })

  it('handles February in a leap year and a common year', () => {
    expect(monthRange(2024, 2).end).toBe('2024-02-29')
    expect(monthRange(2026, 2).end).toBe('2026-02-28')
  })
})

describe('useDayRecords', () => {
  it('returns an empty list when the month has no records', async () => {
    h.state.result = { data: [], error: null }
    const { result } = renderHook(() => useDayRecords(2026, 6), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it('returns the records when they exist', async () => {
    h.state.result = {
      data: [{ id: 'd1', date: '2026-06-02', net_hours: 8 }],
      error: null,
    }
    const { result } = renderHook(() => useDayRecords(2026, 6), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].net_hours).toBe(8)
  })
})
