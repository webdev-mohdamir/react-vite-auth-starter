import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
  }`

export function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth()
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const handleLogout = async () => {
    setLogoutError(null)
    try {
      await logout()
    } catch {
      setLogoutError('Your session was cleared here, but the server could not confirm sign out.')
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <NavLink className="text-lg font-bold tracking-tight text-emerald-800" to="/dashboard">
            Fieldnotes
          </NavLink>
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            <NavLink className={navLinkClass} to="/dashboard">Dashboard</NavLink>
            <NavLink className={navLinkClass} to="/sessions">Sessions</NavLink>
            {isAuthenticated ? (
              <>
                <span className="hidden px-2 text-sm text-slate-500 sm:inline">{user?.email}</span>
                <button
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  onClick={() => void handleLogout()}
                  type="button"
                >
                  Sign out
                </button>
              </>
            ) : (
              <NavLink className={navLinkClass} to="/login">Sign in</NavLink>
            )}
          </nav>
        </div>
      </header>
      {logoutError && (
        <p className="mx-auto mt-4 max-w-6xl px-5 text-sm text-rose-700" role="alert">
          {logoutError}
        </p>
      )}
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <Outlet />
      </main>
    </div>
  )
}
