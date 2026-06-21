import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock the Supabase client so tests never hit the network.
// getSession resolves to "no session", so the app shows the sign-in screen.
vi.mock('./data/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
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

function renderApp() {
  return render(
    <AppThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppThemeProvider>,
  )
}

describe('App (signed out)', () => {
  it('shows the Hebrew sign-in screen once loading resolves', async () => {
    renderApp()
    expect(
      await screen.findByRole('heading', { name: 'התחברות' }),
    ).toBeInTheDocument()
  })

  it('renders email and password fields', async () => {
    renderApp()
    // Required fields render with a trailing "*", so match loosely.
    expect(await screen.findByLabelText(/אימייל/)).toBeInTheDocument()
    expect(screen.getByLabelText(/סיסמה/)).toBeInTheDocument()
  })
})
