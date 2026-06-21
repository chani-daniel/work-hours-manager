import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMonth, useSaveMonthTarget } from '../../data/useMonth'
import { countWorkingDays, computeSDH } from '../../domain/workingDays'

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

export function TargetPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const monthQuery = useMonth(year, month)
  const saveTarget = useSaveMonthTarget()

  const [value, setValue] = useState('')
  const [savedOpen, setSavedOpen] = useState(false)

  // Prefill the field once the saved target loads.
  useEffect(() => {
    if (monthQuery.data) setValue(String(monthQuery.data.monthly_target))
  }, [monthQuery.data])

  const numeric = Number(value)
  const hasInput = value.trim() !== ''
  // EC-13: target must be a number greater than 0.
  const isValid = hasInput && Number.isFinite(numeric) && numeric > 0

  const workingDays = countWorkingDays(year, month)
  const sdh = isValid ? computeSDH(numeric, workingDays) : 0

  const handleSave = async () => {
    if (!isValid) return
    await saveTarget.mutateAsync({ year, month, monthlyTarget: numeric })
    setSavedOpen(true)
  }

  if (monthQuery.isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', py: { xs: 2, sm: 5 } }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: 460,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 1px 2px rgba(16,40,42,0.06), 0 12px 32px rgba(16,40,42,0.08)',
          p: { xs: 3, sm: 4 },
        }}
      >
        <Stack spacing={3}>
          {/* Eyebrow: which month this target is for */}
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', letterSpacing: 2, fontWeight: 700 }}
            >
              {HEBREW_MONTHS[month - 1]} {year}
            </Typography>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mt: 0.5 }}>
              היעד החודשי שלי
            </Typography>
          </Box>

          {/* Hero: the editable target number */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
            <TextField
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type="number"
              variant="standard"
              placeholder="0"
              error={hasInput && !isValid}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.5,
                  style: { fontSize: 56, fontWeight: 800, textAlign: 'center', width: 160 },
                },
              }}
            />
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              שעות
            </Typography>
          </Stack>

          {hasInput && !isValid && (
            <Typography variant="body2" color="error">
              יש להזין מספר שעות גדול מ-0.
            </Typography>
          )}

          {/* Signature: what the target means per working day (live SDH) */}
          <Box
            sx={{
              bgcolor: 'rgba(14,124,134,0.08)',
              borderRadius: 2,
              px: 2.5,
              py: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: 'primary.dark' }}>
              {isValid ? `≈ ${sdh.toFixed(1)} שעות בכל יום עבודה` : 'הזיני יעד כדי לראות שעות ליום'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {workingDays} ימי עבודה החודש (ראשון–חמישי)
            </Typography>
          </Box>

          {saveTarget.isError && (
            <Alert severity="error">שמירת היעד נכשלה. נסי שוב.</Alert>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={!isValid || saveTarget.isPending}
          >
            {saveTarget.isPending ? 'שומר…' : 'שמירת היעד'}
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={savedOpen}
        autoHideDuration={3000}
        onClose={() => setSavedOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSavedOpen(false)}>
          היעד נשמר
        </Alert>
      </Snackbar>
    </Box>
  )
}
