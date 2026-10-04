import axios from 'axios'
import type { RefreshData, SuccessResponse } from '../api/contract'
import { setAccessToken } from '../api/tokenStore'

let inFlightRefresh: Promise<string> | null = null

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'

export function refreshAccessToken(): Promise<string> {
  if (inFlightRefresh) return inFlightRefresh

  const refresh = async (): Promise<string> => {
    const request = async (): Promise<string> => {
      const response = await axios.post<SuccessResponse<RefreshData>>(
        `${apiBaseUrl}/auth/refresh`,
        undefined,
        { withCredentials: true },
      )
      const token = response.data.data.accessToken
      setAccessToken(token)
      return token
    }

    // WHY: A refresh-token replay revokes that device's session, so tabs must rotate the shared cookie sequentially.
    if (typeof navigator !== 'undefined' && navigator.locks) {
      return navigator.locks.request('auth-refresh', request)
    }
    return request()
  }

  const pending = refresh()
  inFlightRefresh = pending
  void pending.then(
    () => {
      if (inFlightRefresh === pending) inFlightRefresh = null
    },
    () => {
      if (inFlightRefresh === pending) inFlightRefresh = null
    },
  )
  return pending
}
