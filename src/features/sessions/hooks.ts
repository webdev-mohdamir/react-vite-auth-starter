import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import type { Session, SuccessResponse } from '../../api/contract'
import { sessionKeys } from './queryKeys'

export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.all,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<SuccessResponse<{ sessions: Session[] }>>(
        '/auth/sessions',
        { signal },
      )
      return response.data.data.sessions
    },
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/auth/sessions/${id}`)
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Session[]>(sessionKeys.all, (sessions) =>
        sessions?.filter((session) => session._id !== id),
      )
    },
  })
}
