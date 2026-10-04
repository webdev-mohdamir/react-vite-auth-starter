export interface SuccessResponse<T> {
  success: true
  data: T
}

export interface ApiError {
  code: string
  message: string
  details?: Array<{
    path: string | Array<string | number>
    message: string
    code?: string
  }>
}

export interface ErrorResponse {
  success: false
  error: ApiError
}

export interface User {
  _id: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface Item {
  _id: string
  owner: string
  title: string
  description?: string
  status: 'open' | 'done'
  rating?: number
  createdAt: string
  updatedAt: string
}

export interface AuthData {
  user: User
  accessToken: string
}

export interface RefreshData {
  accessToken: string
}

export interface ItemListData {
  items: Item[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ItemStats {
  total: number
  perStatus: {
    open: number
    done: number
  }
  averageRating: number
  ratingHistogram: Array<{
    rating: 1 | 2 | 3 | 4 | 5
    count: number
  }>
}

export interface Session {
  _id: string
  userAgent: string
  ip: string
  createdAt: string
  lastUsedAt: string
  expiresAt: string
  current: boolean
}

export interface RegisterInput {
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface CreateItemInput {
  title: string
  description?: string
  status?: 'open' | 'done'
  rating?: number
}

export type UpdateItemInput = Partial<CreateItemInput>

export interface ItemQuery {
  page?: number
  limit?: number
  status?: 'open' | 'done'
  rating?: 1 | 2 | 3 | 4 | 5
  q?: string
  sort?: 'createdAt' | '-createdAt' | 'rating'
}
