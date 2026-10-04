import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import type {
  AuthData,
  LoginInput,
  RegisterInput,
  SuccessResponse,
  User,
} from '../api/contract'
import { setAccessToken } from '../api/tokenStore'
import { queryClient } from '../lib/queryClient'
import { refreshAccessToken } from './refresh'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isBooting: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isBooting, setIsBooting] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // WHY: Restore the cookie-backed session before protected routes decide whether to redirect.
  useEffect(() => {
    let active = true
    const restoreSession = async () => {
      try {
        await refreshAccessToken()
        if (!active) return
        const response = await apiClient.get<SuccessResponse<{ user: User }>>('/users/me')
        if (active) setUser(response.data.data.user)
      } catch {
        setAccessToken(null)
        if (active) setUser(null)
      } finally {
        if (active) setIsBooting(false)
      }
    }

    void restoreSession()
    return () => {
      active = false
    }
  }, [])

  // WHY: Keep React auth state and router navigation in sync when a protected API call loses its session.
  useEffect(() => {
    const expireSession = () => {
      setAccessToken(null)
      setUser(null)
      queryClient.clear()
      navigate('/login', { replace: true, state: { from: location } })
    }
    window.addEventListener('auth:expired', expireSession)
    return () => window.removeEventListener('auth:expired', expireSession)
  }, [location, navigate])

  const login = async (input: LoginInput): Promise<void> => {
    const response = await apiClient.post<SuccessResponse<AuthData>>('/auth/login', input)
    setAccessToken(response.data.data.accessToken)
    setUser(response.data.data.user)
  }

  const register = async (input: RegisterInput): Promise<void> => {
    const response = await apiClient.post<SuccessResponse<AuthData>>('/auth/register', input)
    setAccessToken(response.data.data.accessToken)
    setUser(response.data.data.user)
  }

  const clearLocalAuth = () => {
    setAccessToken(null)
    setUser(null)
    queryClient.clear()
  }

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      clearLocalAuth()
    }
  }

  const logoutAll = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout-all')
    } finally {
      clearLocalAuth()
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', { currentPassword, newPassword })
    clearLocalAuth()
  }

  // WHY: A stable context value prevents auth consumers rerendering for provider-internal work.
  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null,
    isBooting,
    login,
    register,
    logout,
    logoutAll,
    changePassword,
  }), [user, isBooting])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
