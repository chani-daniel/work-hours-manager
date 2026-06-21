import { useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import type { Event, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { he } from 'date-fns/locale'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { useDayRecords } from '../../data/useDayRecords'
import type { DayRecord } from '../../data/types'
import { DayEditor } from './DayEditor'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: he }), // week starts Sunday
  getDay,
  locales: { he },
})

// Hebrew labels for the calendar toolbar.
const messages = {
  today: 'היום',
  previous: 'הקודם',
  next: 'הבא',
  month: 'חודש',
  date: 'תאריך',
  noEventsInRange: 'אין רישומים בטווח זה.',
}

// Short label shown on a day in the grid.
function eventTitle(r: DayRecord): string {
  switch (r.day_type) {
    case 'holiday':
      return 'חג'
    case 'vacation_full':
      return 'חופשה'
    case 'vacation_half':
      return 'חצי חופשה'
    default:
      return r.net_hours > 0 ? `${r.net_hours} ש׳` : '—'
  }
}

// Parse a 'YYYY-MM-DD' string into a local Date (avoids UTC shifts).
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateStr(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selected, setSelected] = useState<Date | null>(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth() + 1
  const { data: records = [] } = useDayRecords(year, month)

  const events: Event[] = useMemo(
    () =>
      records.map((r) => {
        const date = parseLocalDate(r.date)
        return { title: eventTitle(r), start: date, end: date, allDay: true, resource: r }
      }),
    [records],
  )

  return (
    <Stack spacing={2}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
        לוח שנה
      </Typography>

      <Card elevation={2}>
        <CardContent>
          <Box sx={{ height: { xs: 460, sm: 600 } }}>
            <Calendar
              localizer={localizer}
              culture="he"
              rtl
              messages={messages}
              events={events}
              views={['month'] as View[]}
              view="month"
              date={viewDate}
              onNavigate={(date) => setViewDate(date)}
              onView={() => {}}
              selectable
              onSelectSlot={(slot) => setSelected(slot.start as Date)}
              onSelectEvent={(event) => setSelected((event.start as Date) ?? null)}
              popup
            />
          </Box>
        </CardContent>
      </Card>

      <Card elevation={1}>
        <CardContent>
          <Typography sx={{ color: 'text.secondary' }}>
            בחרי יום בלוח כדי לדווח עליו או לערוך אותו.
          </Typography>
        </CardContent>
      </Card>

      {selected && (
        <DayEditor
          key={toDateStr(selected)}
          open
          date={toDateStr(selected)}
          record={records.find((r) => r.date === toDateStr(selected))}
          onClose={() => setSelected(null)}
        />
      )}
    </Stack>
  )
}
