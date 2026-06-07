import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getPublicMessagesApi } from '@/apis/message'
import type { PageResult, Pagination } from '@/types/common'
import type { PublicMessage, PublicMessageListParams } from '@/types/message'
import {
  createDisplayCacheKey,
  readDisplayCache,
  shouldRefreshForBrowserReload,
  writeDisplayCache,
} from '@/utils/displayCache'

const defaultPagination = (): Pagination => ({
  page: 1,
  pageSize: 24,
  total: 0,
  totalPages: 0,
})

export const useMessageStore = defineStore('message', () => {
  const loading = ref(false)
  const publicMessages = ref<PublicMessage[]>([])
  const publicPagination = ref<Pagination>(defaultPagination())

  /** 获取公开留言板内容，只展示审核通过的留言和回复。 */
  async function fetchPublicMessages(
    params: PublicMessageListParams = { page: 1, pageSize: 24 },
    options: { force?: boolean } = {},
  ) {
    const cacheKey = createDisplayCacheKey('public-messages', params)
    const cached = readDisplayCache<PageResult<PublicMessage>>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      publicMessages.value = cached.list
      publicPagination.value = cached.pagination
      return cached
    }

    loading.value = true

    try {
      const result = await getPublicMessagesApi(params)
      publicMessages.value = result.list
      publicPagination.value = result.pagination
      writeDisplayCache(cacheKey, result)
      return result
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    publicMessages,
    publicPagination,
    fetchPublicMessages,
  }
})
