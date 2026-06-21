import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { computeNetHours } from '../../domain/computeNetHours'
import type { NetHoursResult } from '../../domain/computeNetHours'
import { useUpsertDayRecord } from '../../data/useDayRecords'
import type { DayRecord, DayType } from '../../data/types'

const DAY_TYPE_OPTIONS: { value: DayType; label: string }[] = [
  { value: 'working', label: 'יום עבודה' },
  { value: 'weekend', label: 'סוף שבוע' },
  { value: 'holiday', label: 'חג' },
  { value: 'vacation_full', label: 'חופשה' },
  { value: 'vacation_half', label: 'חצי חופשה' },
]

const TIME_OFF: DayType[] = ['holiday', 'vacation_full', 'vacation_half']

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateStr(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function num(value: string): number {
  return value.trim() === '' ? 0 : Number(value)
}

// Map a net-hours error to Hebrew (SPEC EC-1, EC-2, EC-4).
function netErrorText(error: NetHoursResult & { ok: false }): string {
  switch (error.error) {
    case 'end_before_start':
      return 'שעת הסיום חייבת להיות אחרי שעת ההתחלה.'
    case 'overage_exceeds_duration':
      return 'חריגת ההפסקה גדולה ממשך היום.'
    case 'invalid_direct_hours':
      return 'מספר השעות חייב להיות בין 0 ל-24.'
  }
}

export function DayEditor({
  date,
  record,
  open,
  onClose,
}: {
  date: string
  record?: DayRecord
  open: boolean
  onClose: () => void
}) {
  const upsert = useUpsertDayRecord()

  const [dayType, setDayType] = useState<DayType>(record?.day_type ?? 'working')
  const [method, setMethod] = useState<'range' | 'direct'>(
    record?.entry_method === 'direct' ? 'direct' : 'range',
  )
  const [start, setStart] = useState(record?.start_time?.slice(0, 5) ?? '')
  const [end, setEnd] = useState(record?.end_time?.slice(0, 5) ?? '')
  const [directHours, setDirectHours] = useState(
    record?.direct_hours != null ? String(record.direct_hours) : '',
  )
  const [breakOverage, setBreakOverage] = useState(
    record?.break_overage ? String(record.break_overage) : '',
  )

  const isTimeOff = TIME_OFF.includes(dayType)
  const isFuture = date > toDateStr(new Date())
  // EC-10: work hours cannot be logged for a future date (time off is allowed).
  const futureWorkBlocked = isFuture && !isTimeOff
  // EC-6: switching a day that already had hours to time off will clear them.
  const clearsLoggedHours = isTimeOff && (record?.net_hours ?? 0) > 0

  // Live net-hours result for hour-based days.
  const netResult: NetHoursResult | null = (() => {
    if (isTimeOff) return { ok: true, hours: 0 }
    if (method === 'range') {
      if (!start || !end) return null
      return computeNetHours({ method: 'range', start, end, breakOverage: num(breakOverage) })
    }
    if (!directHours) return null
    return computeNetHours({ method: 'direct', directHours: Number(directHours), breakOverage: num(breakOverage) })
  })()

  const canSave =
    !futureWorkBlocked && (isTimeOff || netResult?.ok === true) && !upsert.isPending

  const handleSave = async () => {
    if (!canSave) return
    if (isTimeOff) {
      await upsert.mutateAsync({
        date,
        day_type: dayType,
        entry_method: 'none',
        start_time: null,
        end_time: null,
        direct_hours: null,
        break_overage: 0,
        net_hours: 0,
      })
    } else {
      const netHours = netResult && netResult.ok ? netResult.hours : 0
      await upsert.mutateAsync({
        date,
        day_type: dayType,
        entry_method: method,
        start_time: method === 'range' ? start : null,
        end_time: method === 'range' ? end : null,
        direct_hours: method === 'direct' ? Number(directHours) : null,
        break_overage: num(breakOverage),
        net_hours: netHours,
      })
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {format(parseLocalDate(date), 'EEEE, d בMMMM yyyy', { locale: he })}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            select
            label="סוג היום"
            value={dayType}
            onChange={(e) => setDayType(e.target.value as DayType)}
            fullWidth
          >
            {DAY_TYPE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          {isTimeOff ? (
            <>
              <Alert severity="info">
                יום זה אינו נספר לשעות, ומקטין את היעד החודשי בהתאם.
              </Alert>
              {clearsLoggedHours && (
                <Alert severity="warning">
                  ביום זה כבר דווחו שעות — סימון כחופשה/חג יבטל אותן.
                </Alert>
              )}
            </>
          ) : (
            <>
              <ToggleButtonGroup
                value={method}
                exclusive
                onChange={(_e, v) => v && setMethod(v)}
                fullWidth
                size="small"
              >
                <ToggleButton value="range">טווח שעות</ToggleButton>
                <ToggleButton value="direct">שעות ישירות</ToggleButton>
              </ToggleButtonGroup>

              {method === 'range' ? (
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label="התחלה"
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    label="סיום"
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Stack>
              ) : (
                <TextField
                  label="שעות נטו"
                  type="number"
                  value={directHours}
                  onChange={(e) => setDirectHours(e.target.value)}
                  fullWidth
                />
              )}

              <TextField
                label="חריגת הפסקה (שעות)"
                type="number"
                value={breakOverage}
                onChange={(e) => setBreakOverage(e.target.value)}
                fullWidth
                helperText="אופציונלי — שעות שיש לנכות"
              />

              {netResult?.ok && (
                <Typography sx={{ fontWeight: 700, color: 'primary.dark' }}>
                  שעות נטו: {netResult.hours}
                </Typography>
              )}
              {netResult && !netResult.ok && (
                <Alert severity="error">{netErrorText(netResult)}</Alert>
              )}
            </>
          )}

          {futureWorkBlocked && (
            <Alert severity="error">
              אי אפשר לדווח שעות עבודה על תאריך עתידי.
            </Alert>
          )}

          {upsert.isError && <Alert severity="error">השמירה נכשלה. נסי שוב.</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          {upsert.isPending ? 'שומר…' : 'שמירה'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
