import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { Link as RouterLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { OfflineIndicator } from './OfflineIndicator'

// Shared shell for the signed-in app: top navigation, offline indicator,
// and an Outlet where the active page renders.
export function AppLayout() {
  const { signOut } = useAuth()

  const handleSignOut = () => {
    // After sign-out the session clears and ProtectedRoute redirects to /signin.
    void signOut()
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ניהול שעות עבודה
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button color="inherit" component={RouterLink} to="/">
              דשבורד
            </Button>
            <Button color="inherit" component={RouterLink} to="/target">
              יעד
            </Button>
            <Button color="inherit" component={RouterLink} to="/calendar">
              לוח שנה
            </Button>
            <Button color="inherit" onClick={handleSignOut}>
              התנתקות
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <OfflineIndicator />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
