import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../auth/AuthContext'
import { LoginPage } from './LoginPage'

const authContext: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isBooting: false,
  login: vi.fn(async () => {}),
  register: vi.fn(async () => {}),
  logout: vi.fn(async () => {}),
  logoutAll: vi.fn(async () => {}),
  changePassword: vi.fn(async () => {}),
}

describe('LoginPage', () => {
  it('shows validation errors for malformed email and a password under 12 characters', async () => {
    const user = userEvent.setup()
    render(
      <AuthContext.Provider value={authContext}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'too-short')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 12 characters')).toBeInTheDocument()
    expect(authContext.login).not.toHaveBeenCalled()
  })
})
