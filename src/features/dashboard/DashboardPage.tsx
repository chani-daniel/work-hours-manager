import { Card, CardContent, Stack, Typography } from '@mui/material'
import { useAuth } from '../auth/AuthProvider'

// Placeholder dashboard. Real content arrives in TASK-013.
export function DashboardPage() {
  const { user } = useAuth()
  return (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            דשבורד
          </Typography>
          <Typography variant="body2" color="text.secondary">
            שלום, {user?.email}. כאן יוצגו השעות שנעברו, היתרה והקצב הנדרש (TASK-013).
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
