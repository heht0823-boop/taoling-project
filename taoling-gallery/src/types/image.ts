import type { PageParams } from './common'
import type { CategoryItem } from './category'
import type { TagItem } from './tag'

export type ImageSort = 'latest' | 'hot' | 'downloads' | 'favorites' | 'weight'

export interface GalleryImage {
  id: number
  title: string
  description?: string
  image_url: string
  thumbnail_url?: string
  aspect_ratio?: string
  category?: CategoryItem | null
  tags?: TagItem[]
  view_count?: number
  download_count?: number
  favorite_count?: number
  is_favorited?: boolean
  created_at?: string
}

export interface ImageViewResult {
  image_id: number
  view_count: number
}

export interface ImageListParams extends PageParams {
  keyword?: string
  category_id?: number
  tag_id?: number
  tag_ids?: string
  aspect_ratio?: string
  sort?: ImageSort
}
