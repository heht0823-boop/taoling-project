import { requestData } from '@/utils/request'
import type { CategoryItem } from '@/types/category'

/** 获取游客可见的公开分类列表。 */
export function getCategoryListApi() {
  return requestData<CategoryItem[]>({
    url: '/categories',
    method: 'GET',
  })
}
