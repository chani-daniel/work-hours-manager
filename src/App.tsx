import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { useAuth } from './features/auth/AuthProvider'
import { AuthScreen } from './features/auth/AuthScreen'

// Signed-in placeholder view. Real screens arrive in later tasks (TASK-011 onward).
function SignedInView() {
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              ניהול שעות עבודה
            </Typography>
            <Button variant="outlined" onClick={handleSignOut} disabled={signingOut}>
              התנתקות
            </Button>
          </Stack>

          <Card elevation={2}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6" component="h2">
                  שלום 👋
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  את מחוברת כעת כ־{user?.email}. המסכים של האפליקציה יתווספו במשימות
                  הבאות.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}

function App() {
  const { loading, session } = useAuth()

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return session ? <SignedInView /> : <AuthScreen />
}

export default App
