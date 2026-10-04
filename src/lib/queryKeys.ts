import type { ItemQuery } from '../api/contract'

export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (query: ItemQuery) => [...itemKeys.lists(), query] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
  stats: () => [...itemKeys.all, 'stats'] as const,
}

export const sessionKeys = {
  all: ['sessions'] as const,
}
