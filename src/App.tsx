import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from './features/auth/AuthProvider'
import { AuthScreen } from './features/auth/AuthScreen'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'
import { AppLayout } from './features/layout/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { CalendarPage } from './features/calendar/CalendarPage'

function App() {
  const { loading } = useAuth()

  // Wait until the initial session check finishes before deciding what to show,
  // so a signed-in user is not briefly bounced to the sign-in screen on refresh.
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth screens — redirected away once signed in. */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/signin" element={<AuthScreen mode="signin" />} />
          <Route path="/signup" element={<AuthScreen mode="signup" />} />
        </Route>

        {/* Protected app — requires a session, wrapped in the shared layout. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>
        </Route>

        {/* Unknown paths fall back to the dashboard (or sign-in if signed out). */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
