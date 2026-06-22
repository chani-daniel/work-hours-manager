import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Month, DayRecord } from '../../data/types'

// Mutable mock state so each test can choose what the hooks return.
const h = vi.hoisted(() => ({
  month: null as Month | null,
  records: [] as DayRecord[],
}))

vi.mock('../../data/useMonth', () => ({
  useMonth: () => ({ data: h.month, isLoading: false }),
}))
vi.mock('../../data/useDayRecords', () => ({
  useDayRecords: () => ({ data: h.records, isLoading: false }),
}))

import { AppThemeProvider } from '../../theme/AppThemeProvider'
import { DashboardPage } from './DashboardPage'

function renderDashboard() {
  return render(
    <AppThemeProvider>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </AppThemeProvider>,
  )
}

beforeEach(() => {
  h.month = null
  h.records = []
})

describe('DashboardPage', () => {
  it('prompts to set a target when none exists (EC-13)', () => {
    h.month = null
    renderDashboard()
    expect(screen.getByText(/עדיין לא הגדרת יעד/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'הגדרת יעד' })).toBeInTheDocument()
  })

  it('shows progress toward the target when one is set', () => {
    h.month = {
      id: 'm1',
      user_id: 'u1',
      year: 2026,
      month: 6,
      monthly_target: 160,
      created_at: '2026-06-01T00:00:00Z',
    }
    h.records = []
    renderDashboard()
    expect(screen.getByRole('heading', { name: 'ההתקדמות שלי' })).toBeInTheDocument()
    // No time off → adjusted target equals the target; nothing worked yet.
    expect(screen.getByText('0 מתוך 160 שעות')).toBeInTheDocument()
  })
})
