import { ref } from 'vue'
import { defineStore } from 'pinia'

import { addFavoriteApi, cancelFavoriteApi, getFavoriteListApi } from '@/apis/favorite'
import type { PageResult, Pagination } from '@/types/common'
import type { FavoriteRecord } from '@/types/favorite'
import {
  createDisplayCacheKey,
  readDisplayCache,
  shouldRefreshForBrowserReload,
  writeDisplayCache,
} from '@/utils/displayCache'

export const useFavoriteStore = defineStore('favorite', () => {
  const list = ref<FavoriteRecord[]>([])
  const pagination = ref<Pagination>({ page: 1, pageSize: 6, total: 0 })
  const loading = ref(false)
  const toggling = ref(false)
  const error = ref('')

  /** 获取我的收藏列表。 */
  async function fetchFavorites(page = 1, pageSize = 6, options: { force?: boolean } = {}) {
    const params = { page, pageSize }
    const cacheKey = createDisplayCacheKey('user-favorites', params)
    const cached = readDisplayCache<PageResult<FavoriteRecord>>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      list.value = cached.list
      pagination.value = cached.pagination
      return cached
    }

    loading.value = true
    error.value = ''

    try {
      const result = await getFavoriteListApi(params)
      list.value = result.list
      pagination.value = result.pagination
      writeDisplayCache(cacheKey, result)
      return result
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '收藏记录加载失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  /** 根据当前状态收藏或取消收藏图片。 */
  async function toggleFavorite(imageId: number, isFavorited?: boolean) {
    toggling.value = true
    error.value = ''

    try {
      return isFavorited ? await cancelFavoriteApi(imageId) : await addFavoriteApi(imageId)
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '收藏操作失败'
      throw requestError
    } finally {
      toggling.value = false
    }
  }

  return {
    list,
    pagination,
    loading,
    toggling,
    error,
    fetchFavorites,
    toggleFavorite,
  }
})
