import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

const loggedOutContext: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isBooting: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  logoutAll: async () => {},
  changePassword: async () => {},
}

function LoginDestination() {
  const location = useLocation()
  const state = location.state as { from?: { pathname: string; search: string } } | null
  return <p>redirected from {state?.from?.pathname}{state?.from?.search}</p>
}

describe('ProtectedRoute', () => {
  it('redirects logged-out users to login and remembers their location', () => {
    render(
      <AuthContext.Provider value={loggedOutContext}>
        <MemoryRouter initialEntries={['/dashboard?tab=recent']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<h1>Private dashboard</h1>} />
            </Route>
            <Route path="/login" element={<LoginDestination />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(screen.getByText('redirected from /dashboard?tab=recent')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Private dashboard' })).not.toBeInTheDocument()
  })
})
