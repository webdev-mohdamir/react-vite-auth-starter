import axios, { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { RefreshData, SuccessResponse } from '../api/contract'
import { getAccessToken, setAccessToken } from '../api/tokenStore'
import { refreshAccessToken } from './refresh'

describe('refreshAccessToken', () => {
  const originalLocks = Object.getOwnPropertyDescriptor(navigator, 'locks')

  afterEach(() => {
    vi.restoreAllMocks()
    setAccessToken(null)
    if (originalLocks) {
      Object.defineProperty(navigator, 'locks', originalLocks)
    } else {
      Reflect.deleteProperty(navigator, 'locks')
    }
  })

  it('shares concurrent requests in a tab and requests the cross-tab lock', async () => {
    const lockRequest = vi.fn(
      async (_name: string, callback: () => Promise<string>) => callback(),
    )
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request: lockRequest },
    })

    const response: AxiosResponse<SuccessResponse<RefreshData>> = {
      data: { success: true, data: { accessToken: 'fresh-token' } },
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {} as InternalAxiosRequestConfig,
    }
    const networkRequest = vi.spyOn(axios, 'post').mockResolvedValue(response)

    const results = await Promise.all([refreshAccessToken(), refreshAccessToken()])

    expect(results).toEqual(['fresh-token', 'fresh-token'])
    expect(networkRequest).toHaveBeenCalledTimes(1)
    expect(lockRequest).toHaveBeenCalledTimes(1)
    expect(lockRequest).toHaveBeenCalledWith('auth-refresh', expect.any(Function))
    expect(getAccessToken()).toBe('fresh-token')
  })
})
