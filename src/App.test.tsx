import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { ItemListData, ItemStats } from './api/contract'
import { AuthContext, type AuthContextValue } from './auth/AuthContext'
import { itemKeys } from './lib/queryKeys'
import App from './App'

const authenticatedContext: AuthContextValue = {
  user: {
    _id: 'user-1',
    email: 'reader@example.com',
    role: 'user',
    createdAt: '',
    updatedAt: '',
  },
  isAuthenticated: true,
  isBooting: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  logoutAll: async () => {},
  changePassword: async () => {},
}

describe('app routing foundation', () => {
  it('renders the dashboard route', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
    queryClient.setQueryData<ItemStats>(itemKeys.stats(), {
      total: 0,
      perStatus: { open: 0, done: 0 },
      averageRating: 0,
      ratingHistogram: [],
    })
    queryClient.setQueryData<ItemListData>(
      itemKeys.list({ page: 1, limit: 10, sort: '-createdAt' }),
      { items: [], page: 1, limit: 10, total: 0, totalPages: 0 },
    )
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthContext.Provider value={authenticatedContext}>
            <App />
          </AuthContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Your dashboard' })).toBeInTheDocument()
  })
})
