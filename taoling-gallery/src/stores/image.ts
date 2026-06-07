import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  createImageViewApi,
  getImageDetailApi,
  getImageListApi,
  getRelatedImagesApi,
} from '@/apis/image'
import type { Pagination } from '@/types/common'
import type { PageResult } from '@/types/common'
import type { GalleryImage, ImageListParams, ImageSort } from '@/types/image'
import {
  createDisplayCacheKey,
  readDisplayCache,
  shouldRefreshForBrowserReload,
  writeDisplayCache,
} from '@/utils/displayCache'

const defaultPagination: Pagination = {
  page: 1,
  pageSize: 12,
  total: 0,
}

export const useImageStore = defineStore('image', () => {
  const list = ref<GalleryImage[]>([])
  const detail = ref<GalleryImage | null>(null)
  const related = ref<GalleryImage[]>([])
  const loading = ref(false)
  const error = ref('')
  const pagination = ref<Pagination>({ ...defaultPagination })
  const query = reactive<ImageListParams>({
    page: 1,
    pageSize: 12,
    sort: 'latest',
  })

  const hasImages = computed(() => list.value.length > 0)
  const hasMore = computed(() => {
    const loaded = pagination.value.page * pagination.value.pageSize
    return loaded < pagination.value.total
  })

  /** 获取公开图库列表，所有页面筛选条件都由 store 统一维护。 */
  async function fetchImages(params: Partial<ImageListParams> = {}, options: { force?: boolean } = {}) {
    Object.assign(query, params)
    const requestParams = {
        page: query.page || 1,
        pageSize: query.pageSize || 12,
        keyword: query.keyword || undefined,
        category_id: query.category_id,
        tag_id: query.tag_id,
        aspect_ratio: query.aspect_ratio || undefined,
        sort: query.sort || 'latest',
      }
    const cacheKey = createDisplayCacheKey('public-images', requestParams)
    const cached = readDisplayCache<PageResult<GalleryImage>>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      list.value = cached.list
      pagination.value = cached.pagination
      return cached
    }

    loading.value = true
    error.value = ''

    try {
      const result = await getImageListApi(requestParams)

      list.value = result.list
      pagination.value = result.pagination
      writeDisplayCache(cacheKey, result)
      return result
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '图库加载失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  /** 重置分页并按新的筛选条件重新拉取图片。 */
  async function searchImages(params: Partial<ImageListParams> = {}) {
    return fetchImages({
      ...params,
      page: 1,
      pageSize: query.pageSize || 12,
    })
  }

  /** 加载下一页，追加到现有列表后。 */
  async function loadMoreImages() {
    if (loading.value || !hasMore.value) return
    const nextPage = pagination.value.page + 1

    loading.value = true

    try {
      const result = await getImageListApi({
        page: nextPage,
        pageSize: query.pageSize || 12,
        keyword: query.keyword || undefined,
        category_id: query.category_id,
        tag_id: query.tag_id,
        aspect_ratio: query.aspect_ratio || undefined,
        sort: query.sort || 'latest',
      })

      list.value = [...list.value, ...result.list]
      pagination.value = result.pagination
      return result
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '加载更多失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  /** 切换排序方式后重新获取列表。 */
  async function changeSort(sort: ImageSort) {
    return searchImages({ sort })
  }

  /** 获取图片详情并同步相关推荐。 */
  async function fetchImageDetail(id: number, options: { force?: boolean } = {}) {
    const cacheKey = createDisplayCacheKey('image-detail', { id })
    const cached = readDisplayCache<GalleryImage>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      detail.value = cached
      return cached
    }

    loading.value = true
    error.value = ''
    detail.value = null

    try {
      const result = await getImageDetailApi(id)
      detail.value = result
      writeDisplayCache(cacheKey, result)
      return result
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '图片详情加载失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  /** 获取当前图片相关推荐。 */
  async function fetchRelatedImages(id: number, options: { force?: boolean } = {}) {
    const cacheKey = createDisplayCacheKey('related-images', { id, limit: 6 })
    const cached = readDisplayCache<GalleryImage[]>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      related.value = cached
      return related.value
    }

    try {
      related.value = await getRelatedImagesApi(id, 6)
      writeDisplayCache(cacheKey, related.value)
      return related.value
    } catch {
      related.value = []
      return []
    }
  }

  /** 记录图片浏览次数，失败时不阻断详情展示。 */
  async function recordImageView(id: number) {
    try {
      const result = await createImageViewApi(id)

      if (detail.value?.id === id) {
        detail.value.view_count = result.view_count
      }
    } catch {
      // 浏览记录不影响页面主流程。
    }
  }

  function updateFavoriteState(imageId: number, isFavorited: boolean, favoriteCount: number) {
    if (detail.value?.id === imageId) {
      detail.value.is_favorited = isFavorited
      detail.value.favorite_count = favoriteCount
    }

    list.value = list.value.map((item) =>
      item.id === imageId
        ? {
            ...item,
            is_favorited: isFavorited,
            favorite_count: favoriteCount,
          }
        : item,
    )
  }

  function updateDownloadCount(imageId: number, downloadCount: number) {
    if (detail.value?.id === imageId) {
      detail.value.download_count = downloadCount
    }
  }

  return {
    list,
    detail,
    related,
    loading,
    error,
    pagination,
    query,
    hasImages,
    hasMore,
    fetchImages,
    searchImages,
    loadMoreImages,
    changeSort,
    fetchImageDetail,
    fetchRelatedImages,
    recordImageView,
    updateFavoriteState,
    updateDownloadCount,
  }
})
