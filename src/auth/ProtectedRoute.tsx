import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isBooting } = useAuth()
  const location = useLocation()

  if (isBooting) {
    return (
      <div className="flex min-h-64 items-center justify-center" role="status" aria-label="Loading session">
        <span className="size-9 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
