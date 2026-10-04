import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api/client'
import { itemKeys } from '../lib/queryKeys'
import { queryClient } from '../lib/queryClient'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

vi.mock('./refresh', () => ({
  refreshAccessToken: vi.fn().mockRejectedValue(new Error('No session')),
}))

function LogoutButton() {
  const { logout } = useAuth()
  return <button onClick={() => void logout()} type="button">Log out</button>
}

describe('AuthProvider cache clearing', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
  })

  it('clears cached items after logout', async () => {
    const cachedItems = { items: [{ _id: 'cached-item' }], page: 1 }
    queryClient.setQueryData(itemKeys.list({ page: 1 }), cachedItems)
    vi.spyOn(apiClient, 'post').mockResolvedValue({ status: 204 })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <LogoutButton />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/auth/logout'))
    await waitFor(() => expect(queryClient.getQueryData(itemKeys.list({ page: 1 }))).toBeUndefined())
  })
})
