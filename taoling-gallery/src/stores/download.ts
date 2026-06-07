import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  clearDownloadRecordsApi,
  createDownloadApi,
  deleteDownloadRecordApi,
  getDownloadListApi,
} from '@/apis/download'
import type { PageResult, Pagination } from '@/types/common'
import type { DownloadRecord } from '@/types/download'
import {
  clearDisplayCacheScope,
  createDisplayCacheKey,
  readDisplayCache,
  shouldRefreshForBrowserReload,
  writeDisplayCache,
} from '@/utils/displayCache'

export const useDownloadStore = defineStore('download', () => {
  const list = ref<DownloadRecord[]>([])
  const pagination = ref<Pagination>({ page: 1, pageSize: 6, total: 0 })
  const loading = ref(false)
  const downloading = ref(false)
  const error = ref('')

  /** 获取我的下载记录。 */
  async function fetchDownloads(page = 1, pageSize = 6, options: { force?: boolean } = {}) {
    const params = { page, pageSize }
    const cacheKey = createDisplayCacheKey('user-downloads', params)
    const cached = readDisplayCache<PageResult<DownloadRecord>>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      list.value = cached.list
      pagination.value = cached.pagination
      return cached
    }

    loading.value = true
    error.value = ''

    try {
      const result = await getDownloadListApi(params)
      list.value = result.list
      pagination.value = result.pagination
      writeDisplayCache(cacheKey, result)
      return result
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '下载记录加载失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  /** 创建下载记录并返回后端提供的下载地址。 */
  async function createDownload(imageId: number) {
    downloading.value = true
    error.value = ''

    try {
      return await createDownloadApi(imageId)
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '下载失败'
      throw requestError
    } finally {
      downloading.value = false
    }
  }

  /** 删除单条下载记录。 */
  async function deleteDownloadRecord(recordId: number) {
    await deleteDownloadRecordApi(recordId)
    list.value = list.value.filter((item) => item.id !== recordId)
    pagination.value = {
      ...pagination.value,
      total: Math.max(0, pagination.value.total - 1),
    }
    clearDisplayCacheScope('user-downloads')
  }

  /** 清空全部下载记录。 */
  async function clearDownloadRecords() {
    await clearDownloadRecordsApi()
    list.value = []
    pagination.value = { page: 1, pageSize: pagination.value.pageSize, total: 0 }
    clearDisplayCacheScope('user-downloads')
  }

  return {
    list,
    pagination,
    loading,
    downloading,
    error,
    fetchDownloads,
    createDownload,
    deleteDownloadRecord,
    clearDownloadRecords,
  }
})
