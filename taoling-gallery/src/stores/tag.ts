import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getTagListApi } from '@/apis/tag'
import type { TagItem } from '@/types/tag'
import {
  createDisplayCacheKey,
  readDisplayCache,
  shouldRefreshForBrowserReload,
  writeDisplayCache,
} from '@/utils/displayCache'

export const useTagStore = defineStore('tag', () => {
  const list = ref<TagItem[]>([])
  const loading = ref(false)
  const error = ref('')

  /** 获取公开标签，用于热门搜索和图库筛选。 */
  async function fetchTags(keyword = '', options: { force?: boolean } = {}) {
    const params = { keyword: keyword || undefined, limit: 50 }
    const cacheKey = createDisplayCacheKey('public-tags', params)
    const cached = readDisplayCache<TagItem[]>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      list.value = cached
      return list.value
    }

    loading.value = true
    error.value = ''

    try {
      list.value = await getTagListApi(params)
      writeDisplayCache(cacheKey, list.value)
      return list.value
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '标签加载失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  return {
    list,
    loading,
    error,
    fetchTags,
  }
})
