import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

export function PublicOnlyRoute() {
  const { isAuthenticated, isBooting } = useAuth()

  if (isBooting) {
    return (
      <div className="flex min-h-64 items-center justify-center" role="status" aria-label="Loading session">
        <span className="size-9 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}
