import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock the upsert hook so the editor renders without Supabase/auth.
vi.mock('../../data/useDayRecords', () => ({
  useUpsertDayRecord: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false }),
}))

import { AppThemeProvider } from '../../theme/AppThemeProvider'
import { DayEditor } from './DayEditor'
import type { DayRecord } from '../../data/types'

function renderEditor(date: string, record?: DayRecord) {
  return render(
    <AppThemeProvider>
      <DayEditor open date={date} record={record} onClose={() => {}} />
    </AppThemeProvider>,
  )
}

describe('DayEditor', () => {
  it('computes net hours live for a time range (past day)', () => {
    renderEditor('2020-01-06') // a past Monday
    fireEvent.change(screen.getByLabelText('התחלה'), { target: { value: '09:00' } })
    fireEvent.change(screen.getByLabelText('סיום'), { target: { value: '17:00' } })
    expect(screen.getByText('שעות נטו: 8')).toBeInTheDocument()
  })

  it('shows a Hebrew error when end is before start (EC-1)', () => {
    renderEditor('2020-01-06')
    fireEvent.change(screen.getByLabelText('התחלה'), { target: { value: '17:00' } })
    fireEvent.change(screen.getByLabelText('סיום'), { target: { value: '09:00' } })
    expect(
      screen.getByText('שעת הסיום חייבת להיות אחרי שעת ההתחלה.'),
    ).toBeInTheDocument()
  })

  it('blocks logging work hours on a future date (EC-10)', () => {
    renderEditor('2999-01-01')
    expect(
      screen.getByText('אי אפשר לדווח שעות עבודה על תאריך עתידי.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'שמירה' })).toBeDisabled()
  })

  it('hides the hours inputs for a time-off day type', () => {
    const record = {
      id: 'd1',
      user_id: 'u1',
      date: '2020-01-06',
      day_type: 'vacation_full',
      entry_method: 'none',
      start_time: null,
      end_time: null,
      direct_hours: null,
      break_overage: 0,
      net_hours: 0,
      created_at: '2020-01-06T00:00:00Z',
    } satisfies DayRecord
    renderEditor('2020-01-06', record)
    expect(
      screen.getByText('יום זה אינו נספר לשעות, ומקטין את היעד החודשי בהתאם.'),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('התחלה')).not.toBeInTheDocument()
  })
})
