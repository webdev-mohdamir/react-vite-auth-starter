import axios from 'axios'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ErrorResponse, RefreshData, SuccessResponse } from './contract'
import { getAccessToken, setAccessToken } from './tokenStore'
import { refreshAccessToken } from '../auth/refresh'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

declare module 'axios' {
  interface AxiosRequestConfig {
    _authRetry?: boolean
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const config = error.config as (InternalAxiosRequestConfig & { _authRetry?: boolean }) | undefined
    const requestPath = `${config?.baseURL ?? ''}${config?.url ?? ''}`.split('?')[0] ?? ''
    const isAuthRoute = /(?:^|\/)auth(?:\/|$)/.test(requestPath)

    if (error.response?.status !== 401 || !config || config._authRetry || isAuthRoute) {
      return Promise.reject(error)
    }

    config._authRetry = true
    try {
      await refreshAccessToken()
      return await apiClient.request(config)
    } catch (refreshError) {
      setAccessToken(null)
      window.dispatchEvent(new Event('auth:expired'))
      return Promise.reject(refreshError)
    }
  },
)

export type ApiResponse<T> = AxiosResponse<SuccessResponse<T>>
export type ApiRefreshResponse = ApiResponse<RefreshData>
