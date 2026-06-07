import { requestData } from '@/utils/request'
import type { PageResult } from '@/types/common'
import type { FavoriteListParams, FavoriteRecord, FavoriteResult } from '@/types/favorite'

/** 收藏指定图片。 */
export function addFavoriteApi(imageId: number) {
  return requestData<FavoriteResult>({
    url: `/images/${imageId}/favorite`,
    method: 'POST',
  })
}

/** 取消收藏指定图片。 */
export function cancelFavoriteApi(imageId: number) {
  return requestData<FavoriteResult>({
    url: `/images/${imageId}/favorite`,
    method: 'DELETE',
  })
}

/** 获取我的收藏记录。 */
export function getFavoriteListApi(params: FavoriteListParams) {
  return requestData<PageResult<FavoriteRecord>>({
    url: '/user/favorites',
    method: 'GET',
    params,
  })
}
