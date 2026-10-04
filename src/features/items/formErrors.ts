import axios from 'axios'
import type { UseFormSetError } from 'react-hook-form'
import type { ErrorResponse } from '../../api/contract'

export interface ItemFormValues {
  title: string
  description: string
  status: 'open' | 'done'
  rating: string
}

export function mapItemFormError(
  error: unknown,
  setError: UseFormSetError<ItemFormValues>,
): string {
  if (!axios.isAxiosError<ErrorResponse>(error)) {
    return 'Something went wrong. Please try again.'
  }

  const apiError = error.response?.data?.error
  let mappedField = false
  for (const detail of apiError?.details ?? []) {
    const path = Array.isArray(detail.path) ? detail.path.at(-1) : detail.path.split('.').at(-1)
    if (path === 'title' || path === 'description' || path === 'status' || path === 'rating') {
      setError(path, { type: 'server', message: detail.message })
      mappedField = true
    }
  }

  if (mappedField) return ''
  return apiError?.message ?? 'Something went wrong. Please try again.'
}
