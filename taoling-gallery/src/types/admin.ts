import type { AuthUser, UserStats } from './auth'
import type { PageParams, Status } from './common'
import type { GalleryImage } from './image'

export type AdminImageStatus = 'public' | 'private' | 'draft' | 'deleted'
export type AdminImageSort = 'latest' | 'views' | 'downloads' | 'favorites' | 'weight'
export type AdminLogTargetType = 'image' | 'category' | 'tag' | 'user' | 'system' | string

export interface AdminDashboardStats {
  image_count: number
  user_count: number
  total_view_count: number
  total_download_count: number
  total_favorite_count: number
  ai_conversation_count: number
}

export interface AdminLog {
  id: number
  actor_id?: number | null
  actor_name?: string | null
  actor_role?: string | null
  action_type: string
  target_type: AdminLogTargetType
  target_id?: number | null
  title?: string
  content?: string
  ip_address?: string | null
  created_at?: string
}

export interface AdminLogListParams extends Partial<PageParams> {
  action_type?: string
  target_type?: string
}

export interface AdminUploadedImage {
  image_url: string
  thumbnail_url?: string
}

export interface AdminImage extends GalleryImage {
  status: AdminImageStatus
  display_weight?: number
  deleted_at?: string | null
  tag_ids?: number[]
}

export interface AdminImageListParams extends Partial<PageParams> {
  keyword?: string
  category_id?: number
  status?: AdminImageStatus | ''
  tag_id?: number
  sort?: AdminImageSort
}

export interface AdminImagePayload {
  title: string
  description?: string
  image_url: string
  thumbnail_url?: string
  category_id?: number
  aspect_ratio?: string
  status?: AdminImageStatus
  display_weight?: number
  tag_ids?: number[]
}

export type AdminImageUpdatePayload = Partial<AdminImagePayload>

export interface AdminCategory {
  id: number
  name: string
  sort_order?: number
  status?: Status
  image_count?: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface AdminCategoryPayload {
  name: string
  sort_order?: number
  status?: Status
}

export interface AdminTaxonomyListParams extends Partial<PageParams> {
  keyword?: string
  status?: Status | ''
}

export interface AdminTag {
  id: number
  name: string
  color?: string
  usage_count?: number
  status?: Status
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface AdminTagPayload {
  name: string
  color?: string
  status?: Status
}

export interface AdminUser extends AuthUser {
  stats?: UserStats
}

export interface AdminUserListParams extends Partial<PageParams> {
  keyword?: string
  role?: 'user' | 'admin' | ''
  status?: 'normal' | 'disabled' | ''
}
