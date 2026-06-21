import { Card, CardContent, Stack, Typography } from '@mui/material'

// Placeholder calendar. Real month view + day entry arrive in TASK-012.
export function CalendarPage() {
  return (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            לוח שנה
          </Typography>
          <Typography variant="body2" color="text.secondary">
            כאן יוצג לוח החודש והזנת השעות לכל יום (TASK-012).
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
