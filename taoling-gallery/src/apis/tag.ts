import { requestData } from '@/utils/request'
import type { TagItem } from '@/types/tag'

export interface TagListParams {
  keyword?: string
  limit?: number
}

/** 获取游客可见的公开标签列表，可按关键词搜索。 */
export function getTagListApi(params: TagListParams = {}) {
  return requestData<TagItem[]>({
    url: '/tags',
    method: 'GET',
    params,
  })
}
