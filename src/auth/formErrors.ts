import axios from 'axios'
import type { UseFormSetError } from 'react-hook-form'
import type { ErrorResponse } from '../api/contract'

export interface AuthFormValues {
  email: string
  password: string
}

export function mapAuthError(
  error: unknown,
  setError: UseFormSetError<AuthFormValues>,
): string {
  if (!axios.isAxiosError<ErrorResponse>(error)) {
    return 'Something went wrong. Please try again.'
  }

  const status = error.response?.status
  const apiError = error.response?.data?.error
  if (status === 401) return apiError?.message ?? 'Email or password is incorrect.'
  if (status === 429) return apiError?.message ?? 'Too many attempts. Please wait and try again.'

  let mappedField = false
  for (const detail of apiError?.details ?? []) {
    const path = Array.isArray(detail.path) ? detail.path.at(-1) : detail.path.split('.').at(-1)
    if (path === 'email' || path === 'password') {
      setError(path, { type: 'server', message: detail.message })
      mappedField = true
    }
  }

  if (status === 409 && !mappedField) {
    setError('email', {
      type: 'server',
      message: apiError?.message ?? 'An account with this email already exists.',
    })
    mappedField = true
  }

  if (mappedField) return ''
  return apiError?.message ?? 'Something went wrong. Please try again.'
}
