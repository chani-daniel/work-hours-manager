import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock the data hooks so the screen renders without Supabase/auth.
vi.mock('../../data/useMonth', () => ({
  useMonth: () => ({ data: null, isLoading: false }),
  useSaveMonthTarget: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false }),
}))

import { AppThemeProvider } from '../../theme/AppThemeProvider'
import { TargetPage } from './TargetPage'

function renderPage() {
  return render(
    <AppThemeProvider>
      <TargetPage />
    </AppThemeProvider>,
  )
}

describe('TargetPage', () => {
  it('shows the title and prompts for a target when empty', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { name: 'היעד החודשי שלי' }),
    ).toBeInTheDocument()
    expect(screen.getByText('הזיני יעד כדי לראות שעות ליום')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'שמירת היעד' })).toBeDisabled()
  })

  it('shows the live per-day hint and enables save for a valid target', () => {
    renderPage()
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '180' } })
    expect(screen.getByText(/שעות בכל יום עבודה/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'שמירת היעד' })).toBeEnabled()
  })

  it('blocks an invalid target of 0 (EC-13)', () => {
    renderPage()
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } })
    expect(screen.getByText('יש להזין מספר שעות גדול מ-0.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'שמירת היעד' })).toBeDisabled()
  })
})
