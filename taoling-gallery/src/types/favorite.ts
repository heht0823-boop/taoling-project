import type { PageParams } from './common'
import type { GalleryImage } from './image'

export interface FavoriteResult {
  image_id: number
  is_favorited: boolean
  favorite_count: number
}

export interface FavoriteRecord {
  favorite_id: number
  created_at: string
  image: Pick<GalleryImage, 'id' | 'title' | 'thumbnail_url' | 'image_url' | 'view_count' | 'download_count' | 'favorite_count'>
}

export type FavoriteListParams = PageParams
