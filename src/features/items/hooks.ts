import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import type {
  CreateItemInput,
  Item,
  ItemListData,
  ItemQuery,
  ItemStats,
  SuccessResponse,
  UpdateItemInput,
} from '../../api/contract'
import { itemKeys } from '../../lib/queryKeys'

export function useItems(query: ItemQuery) {
  return useQuery({
    queryKey: itemKeys.list(query),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<SuccessResponse<ItemListData>>('/items', {
        params: query,
        signal,
      })
      return response.data.data
    },
    placeholderData: keepPreviousData,
  })
}

export function useItemStats() {
  return useQuery({
    queryKey: itemKeys.stats(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<SuccessResponse<ItemStats>>('/items/stats', { signal })
      return response.data.data
    },
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<SuccessResponse<{ item: Item }>>(`/items/${id}`, {
        signal,
      })
      return response.data.data.item
    },
    enabled: Boolean(id),
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateItemInput) => {
      const response = await apiClient.post<SuccessResponse<{ item: Item }>>('/items', input)
      return response.data.data.item
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: itemKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: itemKeys.stats() }),
      ])
    },
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateItemInput }) => {
      const response = await apiClient.patch<SuccessResponse<{ item: Item }>>(
        `/items/${id}`,
        input,
      )
      return response.data.data.item
    },
    onSuccess: async (item) => {
      queryClient.setQueryData(itemKeys.detail(item._id), item)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: itemKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: itemKeys.stats() }),
      ])
    },
  })
}

interface DeleteItemContext {
  previousLists: Array<[QueryKey, ItemListData | undefined]>
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation<string, Error, string, DeleteItemContext>({
    mutationFn: async (id) => {
      await apiClient.delete(`/items/${id}`)
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.lists() })
      const previousLists = queryClient.getQueriesData<ItemListData>({
        queryKey: itemKeys.lists(),
      })

      for (const [queryKey, data] of previousLists) {
        if (!data) continue
        const items = data.items.filter((item) => item._id !== id)
        if (items.length === data.items.length) continue
        queryClient.setQueryData<ItemListData>(queryKey, {
          ...data,
          items,
          total: Math.max(0, data.total - 1),
        })
      }

      return { previousLists }
    },
    onError: (_error, _id, context) => {
      for (const [queryKey, data] of context?.previousLists ?? []) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onSettled: async (_item, _error, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: itemKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: itemKeys.stats() }),
        queryClient.removeQueries({ queryKey: itemKeys.detail(id) }),
      ])
    },
  })
}
