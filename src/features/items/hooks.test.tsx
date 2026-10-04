import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ItemListData } from '../../api/contract'
import { apiClient } from '../../api/client'
import { itemKeys } from '../../lib/queryKeys'
import { useDeleteItem } from './hooks'

describe('useDeleteItem', () => {
  afterEach(() => vi.restoreAllMocks())

  it('rolls back its optimistic removal when the API request fails', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const query = { page: 1, limit: 10, sort: '-createdAt' as const }
    const initialData: ItemListData = {
      items: [{
        _id: 'item-1',
        owner: 'user-1',
        title: 'Draft',
        status: 'open',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    }
    queryClient.setQueryData(itemKeys.list(query), initialData)
    vi.spyOn(apiClient, 'delete').mockRejectedValue(new Error('Request failed'))

    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }

    const { result } = renderHook(() => useDeleteItem(), { wrapper: Wrapper })
    act(() => result.current.mutate('item-1'))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(queryClient.getQueryData(itemKeys.list(query))).toEqual(initialData)
    queryClient.clear()
  })
})
