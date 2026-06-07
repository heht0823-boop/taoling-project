import type { PageParams } from './common'

export interface DownloadResult {
  image_id: number
  download_url: string
  download_count: number
}

export interface DownloadRecord {
  id: number
  image_id: number
  image_title: string
  image_url: string
  created_at: string
}

export type DownloadListParams = PageParams
