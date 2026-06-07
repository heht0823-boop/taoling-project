import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getCategoryListApi } from '@/apis/category'
import type { CategoryItem } from '@/types/category'
import {
  createDisplayCacheKey,
  readDisplayCache,
  shouldRefreshForBrowserReload,
  writeDisplayCache,
} from '@/utils/displayCache'

export const useCategoryStore = defineStore('category', () => {
  const list = ref<CategoryItem[]>([])
  const loading = ref(false)
  const error = ref('')

  /** 获取公开分类，用于图库筛选。 */
  async function fetchCategories(options: { force?: boolean } = {}) {
    const cacheKey = createDisplayCacheKey('public-categories')
    const cached = readDisplayCache<CategoryItem[]>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      list.value = cached
      return list.value
    }

    loading.value = true
    error.value = ''

    try {
      list.value = await getCategoryListApi()
      writeDisplayCache(cacheKey, list.value)
      return list.value
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '分类加载失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  return {
    list,
    loading,
    error,
    fetchCategories,
  }
})
