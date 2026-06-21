import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppThemeProvider } from './theme/AppThemeProvider'
import App from './App'

describe('App', () => {
  it('renders the Hebrew app title within the theme provider', () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>,
    )
    expect(
      screen.getByRole('heading', { name: 'ניהול שעות עבודה' }),
    ).toBeInTheDocument()
  })

  it('renders a sample MUI button with inline Hebrew text', () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>,
    )
    expect(
      screen.getByRole('button', { name: 'שמירת יעד' }),
    ).toBeInTheDocument()
  })
})
