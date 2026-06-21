import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock the day-records hook so the calendar renders without Supabase/auth.
vi.mock('../../data/useDayRecords', () => ({
  useDayRecords: () => ({ data: [] }),
}))

import { AppThemeProvider } from '../../theme/AppThemeProvider'
import { CalendarPage } from './CalendarPage'

function renderPage() {
  return render(
    <AppThemeProvider>
      <CalendarPage />
    </AppThemeProvider>,
  )
}

describe('CalendarPage', () => {
  it('renders the Hebrew calendar with its toolbar and selection prompt', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'לוח שנה' })).toBeInTheDocument()
    // Hebrew toolbar label proves the localizer + messages are wired.
    expect(screen.getByRole('button', { name: 'היום' })).toBeInTheDocument()
    // Prompt shown until a day is selected.
    expect(screen.getByText('בחרי יום בלוח כדי לערוך אותו.')).toBeInTheDocument()
  })
})
