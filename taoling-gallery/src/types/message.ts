import type { AuthUser, UserStats } from './auth'
import type { PageParams } from './common'

export type MessageCheckStatus = 'pending' | 'success' | 'block'

export interface AvatarUpload {
  avatar_url: string
  avatar_thumbnail_url: string | null
  avatar_srcset: string | null
  processor_enabled: boolean
}

export interface AvatarUpdateResult {
  user: AuthUser
  stats?: UserStats
  avatar_upload?: AvatarUpload
}

export interface UserMessage {
  id: number
  user_id: number
  parent_id?: number | null
  content: string
  created_at?: string
  updated_at?: string
  user?: PublicMessageUser
}

export type UserMessageListParams = Partial<PageParams>

export interface CreateUserMessageParams {
  content: string
  parent_id?: number
}

export interface CreateUserMessageResult {
  submitted: true
}

export type PublicMessageUser = Pick<AuthUser, 'id' | 'username' | 'avatar_url'>

export interface PublicMessage {
  id: number
  user_id: number
  parent_id?: number | null
  content: string
  created_at?: string
  updated_at?: string
  user?: PublicMessageUser
  replies?: PublicMessage[]
}

export type PublicMessageListParams = Partial<PageParams>

export interface AdminMessage extends UserMessage {
  username?: string
  check_status: MessageCheckStatus
  check_score?: number
  check_result?: Record<string, unknown> | null
  reply_count?: number
  user?: Pick<AuthUser, 'id' | 'username' | 'email' | 'avatar_url' | 'role' | 'status'>
}

export interface AdminMessageListParams extends Partial<PageParams> {
  keyword?: string
  check_status?: MessageCheckStatus | ''
  parent_id?: number | ''
}

export interface AdminMessageDetail {
  id: number
  user_id: number
  username: string
  parent_id: number | null
  content: string
  check_status: MessageCheckStatus
  check_score: number
  check_result: Record<string, unknown> | null
  ip_address: string
  user_agent: string
  created_at: string
  updated_at: string
  user?: Pick<AuthUser, 'id' | 'username' | 'email' | 'avatar_url' | 'role' | 'status'>
  replies: AdminMessage[]
}
