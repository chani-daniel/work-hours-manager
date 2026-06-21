import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock the Supabase client to return an active session, so the guard
// should let us through to the protected app shell.
// (The session is inlined here because vi.mock is hoisted above any consts.)
vi.mock('./data/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'u1', email: 'test@example.com' } } },
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

import { AppThemeProvider } from './theme/AppThemeProvider'
import { AuthProvider } from './features/auth/AuthProvider'
import App from './App'

describe('App (signed in)', () => {
  it('lets a signed-in user reach the app shell with navigation', async () => {
    render(
      <AppThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppThemeProvider>,
    )
    // Lands on the dashboard page (default protected route).
    expect(await screen.findByRole('heading', { name: 'דשבורד' })).toBeInTheDocument()
    // The shared layout's navigation is present.
    expect(screen.getByRole('link', { name: 'לוח שנה' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'התנתקות' })).toBeInTheDocument()
  })
})
