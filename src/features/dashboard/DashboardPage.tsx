import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useMonth } from '../../data/useMonth'
import { useDayRecords } from '../../data/useDayRecords'
import { countWorkingDays, computeSDH } from '../../domain/workingDays'
import { computeAdjustedTarget } from '../../domain/computeAdjustedTarget'
import { computeProgress } from '../../domain/computeProgress'

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

// Show whole numbers plainly, otherwise one decimal.
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <Box sx={{ textAlign: 'center', px: 1 }}>
      <Typography variant="h5" component="div" sx={{ fontWeight: 800 }}>
        {value}
        {unit && (
          <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
            {' '}
            {unit}
          </Typography>
        )}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  )
}

export function DashboardPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const monthQuery = useMonth(year, month)
  const recordsQuery = useDayRecords(year, month)

  if (monthQuery.isLoading || recordsQuery.isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const eyebrow = `${HEBREW_MONTHS[month - 1]} ${year}`
  const target = monthQuery.data?.monthly_target ?? 0
  const records = recordsQuery.data ?? []

  // EC-13: no target set yet — guide the user to set one, no pace calc.
  if (!target) {
    return (
      <Card elevation={2} sx={{ maxWidth: 520, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Stack spacing={2} sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              עדיין לא הגדרת יעד ל{eyebrow}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              כדי לראות התקדמות וקצב נדרש, התחילי בהגדרת יעד השעות לחודש.
            </Typography>
            <Box>
              <Button variant="contained" component={RouterLink} to="/target">
                הגדרת יעד
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  const workingDays = countWorkingDays(year, month)
  const sdh = computeSDH(target, workingDays)
  const adjustedTarget = computeAdjustedTarget(target, sdh, records)
  const progress = computeProgress(adjustedTarget, records, now)

  const pct = adjustedTarget > 0 ? Math.min(100, (progress.hoursWorked / adjustedTarget) * 100) : 0

  // The hero guidance line.
  let guidance: { severity: 'success' | 'warning' | 'info'; text: string }
  if (progress.hoursRemaining <= 0) {
    guidance = { severity: 'success', text: 'עמדת ביעד החודשי 🎉' }
  } else if (progress.requiredPace === null) {
    // EC-7: hours remain but no available days left.
    guidance = { severity: 'warning', text: 'לא ניתן להשלים את היעד בימים שנותרו החודש.' }
  } else {
    guidance = {
      severity: 'info',
      text: `כדי לעמוד ביעד, עבדי בממוצע ${fmt(progress.requiredPace)} שעות בכל אחד מ-${fmt(progress.remainingAvailableDays)} הימים שנותרו.`,
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 640, mx: 'auto' }}>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', letterSpacing: 2, fontWeight: 700 }}
        >
          {eyebrow}
        </Typography>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          ההתקדמות שלי
        </Typography>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <Stack spacing={2.5}>
            {/* Progress toward the adjusted target */}
            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {fmt(progress.hoursWorked)} מתוך {fmt(adjustedTarget)} שעות
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {Math.round(pct)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{ height: 12, borderRadius: 6 }}
              />
            </Box>

            {/* Signature: the guidance as a plain-Hebrew sentence */}
            <Alert severity={guidance.severity} sx={{ fontWeight: 500 }}>
              {guidance.text}
            </Alert>

            {/* Supporting stats */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                pt: 1,
              }}
            >
              <Stat label="שעות שנעברו" value={fmt(progress.hoursWorked)} unit="ש׳" />
              <Stat
                label="שעות שנותרו"
                value={fmt(Math.max(0, progress.hoursRemaining))}
                unit="ש׳"
              />
              <Stat label="ימים זמינים שנותרו" value={fmt(progress.remainingAvailableDays)} />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
        היעד המותאם ({fmt(adjustedTarget)} ש׳) מחושב מהיעד החודשי ({fmt(target)} ש׳) בניכוי חגים וחופשות.{' '}
        <Button component={RouterLink} to="/target" size="small">
          עריכת היעד
        </Button>
      </Typography>
    </Stack>
  )
}
