import type { Role, Status } from './common'

export interface AuthUser {
  id: number
  username: string
  email?: string
  role: Role
  status: Status
  avatar_url?: string | null
  avatar_thumbnail_url?: string | null
  avatar_srcset?: string | null
  last_login_at?: string
  created_at?: string
}

export interface UserStats {
  favorite_count: number
  download_count: number
  view_count: number
  ai_conversation_count: number
  ai_message_count: number
}

export interface RegisterParams {
  username: string
  email?: string
  password: string
}

export interface LoginParams {
  account: string
  password: string
}

export interface AuthResult {
  user: AuthUser
  stats?: UserStats
}

export interface MeResult {
  user: AuthUser
  stats?: UserStats
}
