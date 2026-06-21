import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'

// Keeps already signed-in users away from the auth screens
// (and prevents a /signin <-> / redirect loop).
export function PublicOnlyRoute() {
  const { session } = useAuth()
  if (session) return <Navigate to="/" replace />
  return <Outlet />
}
