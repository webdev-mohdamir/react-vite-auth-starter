import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { RefreshData, SuccessResponse } from './contract'
import { apiClient } from './client'
import { setAccessToken } from './tokenStore'

describe('apiClient authentication retry', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    setAccessToken(null)
  })

  it('refreshes once and retries a 401 request exactly once', async () => {
    let requestCount = 0
    const adapter: AxiosAdapter = async (config) => {
      requestCount += 1
      if (requestCount === 1) {
        const response: AxiosResponse = {
          data: { success: false, error: { code: 'UNAUTHORIZED', message: 'Expired' } },
          status: 401,
          statusText: 'Unauthorized',
          headers: new AxiosHeaders(),
          config,
        }
        throw new AxiosError('Expired', 'ERR_BAD_REQUEST', config, undefined, response)
      }

      return {
        data: { success: true, data: { user: { _id: 'user-1' } } },
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config,
      }
    }
    const refreshResponse: AxiosResponse<SuccessResponse<RefreshData>> = {
      data: { success: true, data: { accessToken: 'fresh-token' } },
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {} as InternalAxiosRequestConfig,
    }
    const refreshRequest = vi.spyOn(axios, 'post').mockResolvedValue(refreshResponse)

    const response = await apiClient.get('/users/me', { adapter })

    expect(response.status).toBe(200)
    expect(requestCount).toBe(2)
    expect(refreshRequest).toHaveBeenCalledTimes(1)
  })
})
