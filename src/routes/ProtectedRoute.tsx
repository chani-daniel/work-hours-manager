import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'

// Guards routes that require a signed-in user.
// A signed-out user hitting a protected route is redirected to /signin.
export function ProtectedRoute() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/signin" replace />
  return <Outlet />
}
