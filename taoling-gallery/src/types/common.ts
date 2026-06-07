export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages?: number
}

export interface PageResult<T> {
  list: T[]
  pagination: Pagination
}

export type Role = 'admin' | 'user'

export type Status = 'normal' | 'public' | 'private' | 'disabled' | 'deleted'
