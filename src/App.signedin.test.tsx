import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'

// Mock Supabase: an active session (so the guard lets us in) plus a query
// builder that returns "no data", so the dashboard's hooks resolve quietly.
vi.mock('./data/supabaseClient', () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    gte: () => builder,
    lte: () => builder,
    order: () => builder,
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (onF: (v: unknown) => unknown) =>
      Promise.resolve({ data: null, error: null }).then(onF),
  }
  return {
    supabase: {
      auth: {
        getSession: vi
          .fn()
          .mockResolvedValue({ data: { session: { user: { id: 'u1', email: 'test@example.com' } } } }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
      },
      from: () => builder,
    },
  }
})

import { AppThemeProvider } from './theme/AppThemeProvider'
import { AuthProvider } from './features/auth/AuthProvider'
import App from './App'

function renderApp() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <AppThemeProvider>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </AppThemeProvider>,
  )
}

describe('App (signed in)', () => {
  it('lets a signed-in user reach the app shell with navigation', async () => {
    renderApp()
    // The shared layout's navigation proves we passed the auth guard.
    expect(await screen.findByRole('link', { name: 'לוח שנה' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'יעד' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'התנתקות' })).toBeInTheDocument()
  })
})
