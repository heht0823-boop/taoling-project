import { requestData } from '@/utils/request'
import type { PageResult } from '@/types/common'
import type { GalleryImage, ImageListParams, ImageViewResult } from '@/types/image'

/** 获取前台公开图片列表，支持关键词、分类、标签、比例和排序筛选。 */
export function getImageListApi(params: ImageListParams) {
  return requestData<PageResult<GalleryImage>>({
    url: '/images',
    method: 'GET',
    params,
  })
}

/** 获取公开图片详情，登录态可选，后端会返回收藏状态。 */
export function getImageDetailApi(id: number) {
  return requestData<GalleryImage>({
    url: `/images/${id}`,
    method: 'GET',
  })
}

/** 记录图片浏览次数，游客和登录用户都可触发。 */
export function createImageViewApi(id: number, visitorId?: string) {
  return requestData<ImageViewResult>({
    url: `/images/${id}/view`,
    method: 'POST',
    data: {
      visitor_id: visitorId,
    },
    showError: false,
  })
}

/** 获取当前图片相关推荐。 */
export function getRelatedImagesApi(id: number, limit = 6) {
  return requestData<GalleryImage[]>({
    url: `/images/${id}/related`,
    method: 'GET',
    params: {
      limit,
    },
  })
}
