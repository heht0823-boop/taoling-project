import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  blockAdminMessageApi,
  createAdminCategoryApi,
  createAdminImageApi,
  createAdminMessageReplyApi,
  createAdminTagApi,
  deleteAdminCategoryApi,
  deleteAdminImageApi,
  deleteAdminTagApi,
  deleteAdminUserApi,
  getAdminCategoryListApi,
  getAdminImageListApi,
  getAdminLogsApi,
  getAdminMessageDetailApi,
  getAdminMessageListApi,
  getAdminTagListApi,
  getAdminUserListApi,
  getDashboardStatsApi,
  restoreAdminImageApi,
  updateAdminCategoryApi,
  updateAdminImageApi,
  updateAdminImageStatusApi,
  updateAdminTagApi,
  updateAdminUserStatusApi,
  uploadAdminImageFileApi,
} from '@/apis/admin'
import type {
  AdminCategory,
  AdminCategoryPayload,
  AdminDashboardStats,
  AdminImage,
  AdminImageListParams,
  AdminImagePayload,
  AdminImageStatus,
  AdminImageUpdatePayload,
  AdminLog,
  AdminLogListParams,
  AdminTag,
  AdminTagPayload,
  AdminTaxonomyListParams,
  AdminUser,
  AdminUserListParams,
} from '@/types/admin'
import type { PageResult, Pagination } from '@/types/common'
import type { AdminMessage, AdminMessageDetail, AdminMessageListParams } from '@/types/message'
import {
  createDisplayCacheKey,
  readDisplayCache,
  shouldRefreshForBrowserReload,
  writeDisplayCache,
} from '@/utils/displayCache'

const defaultPagination = (): Pagination => ({
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 0,
})

export const useAdminStore = defineStore('admin', () => {
  const loading = ref(false)
  const uploading = ref(false)
  const dashboardStats = ref<AdminDashboardStats | null>(null)
  const logs = ref<AdminLog[]>([])
  const logPagination = ref<Pagination>(defaultPagination())
  const images = ref<AdminImage[]>([])
  const imagePagination = ref<Pagination>(defaultPagination())
  const categories = ref<AdminCategory[]>([])
  const tags = ref<AdminTag[]>([])
  const users = ref<AdminUser[]>([])
  const userPagination = ref<Pagination>(defaultPagination())
  const messages = ref<AdminMessage[]>([])
  const messagePagination = ref<Pagination>(defaultPagination())
  const messageDetail = ref<AdminMessageDetail | null>(null)

  /** 获取管理中心统计数据。 */
  async function fetchDashboardStats(options: { force?: boolean } = {}) {
    const cacheKey = createDisplayCacheKey('admin-dashboard-stats')
    const cached = readDisplayCache<AdminDashboardStats>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      dashboardStats.value = cached
      return dashboardStats.value
    }

    loading.value = true
    try {
      dashboardStats.value = await getDashboardStatsApi()
      writeDisplayCache(cacheKey, dashboardStats.value)
      return dashboardStats.value
    } finally {
      loading.value = false
    }
  }

  /** 获取最近操作日志，用于管理首页和日志页。 */
  async function fetchLogs(params: AdminLogListParams = { page: 1, pageSize: 8 }, options: { force?: boolean } = {}) {
    const cacheKey = createDisplayCacheKey('admin-logs', params)
    const cached = readDisplayCache<PageResult<AdminLog>>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      logs.value = cached.list
      logPagination.value = cached.pagination
      return cached
    }

    loading.value = true
    try {
      const result = await getAdminLogsApi(params)
      logs.value = result.list
      logPagination.value = result.pagination
      writeDisplayCache(cacheKey, result)
      return result
    } finally {
      loading.value = false
    }
  }

  /** 转换后的文件上传到后端文件服务。 */
  async function uploadImageFile(file: File) {
    uploading.value = true
    try {
      return await uploadAdminImageFileApi(file)
    } finally {
      uploading.value = false
    }
  }

  /** 新建图库图片记录。 */
  async function createImage(data: AdminImagePayload) {
    loading.value = true
    try {
      return await createAdminImageApi(data)
    } finally {
      loading.value = false
    }
  }

  /** 获取管理员图片列表。 */
  async function fetchImages(
    params: AdminImageListParams = { page: 1, pageSize: 9, sort: 'latest' },
    options: { force?: boolean } = {},
  ) {
    const cacheKey = createDisplayCacheKey('admin-images', params)
    const cached = readDisplayCache<PageResult<AdminImage>>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      images.value = cached.list
      imagePagination.value = cached.pagination
      return cached
    }

    loading.value = true
    try {
      const result = await getAdminImageListApi(params)
      images.value = result.list
      imagePagination.value = result.pagination
      writeDisplayCache(cacheKey, result)
      return result
    } finally {
      loading.value = false
    }
  }

  /** 更新图片标题、描述、分类、标签或权重。 */
  async function updateImage(id: number, data: AdminImageUpdatePayload) {
    loading.value = true
    try {
      const updated = await updateAdminImageApi(id, data)
      images.value = images.value.map((item) => (item.id === id ? updated : item))
      return updated
    } finally {
      loading.value = false
    }
  }

  /** 修改图片状态，成功后同步当前列表。 */
  async function updateImageStatus(id: number, status: AdminImageStatus) {
    loading.value = true
    try {
      const updated = await updateAdminImageStatusApi(id, status)
      images.value = images.value.map((item) => (item.id === id ? updated : item))
      return updated
    } finally {
      loading.value = false
    }
  }

  /** 删除图片后从当前页移除。 */
  async function deleteImage(id: number) {
    loading.value = true
    try {
      await deleteAdminImageApi(id)
      images.value = images.value.filter((item) => item.id !== id)
    } finally {
      loading.value = false
    }
  }

  /** 恢复已删除图片。 */
  async function restoreImage(id: number) {
    loading.value = true
    try {
      const updated = await restoreAdminImageApi(id)
      images.value = images.value.map((item) => (item.id === id ? updated : item))
      return updated
    } finally {
      loading.value = false
    }
  }

  /** 获取分类列表，供上传、筛选和分类管理使用。 */
  async function fetchCategories(
    params: AdminTaxonomyListParams = { page: 1, pageSize: 50 },
    options: { force?: boolean } = {},
  ) {
    const cacheKey = createDisplayCacheKey('admin-categories', params)
    const cached = readDisplayCache<PageResult<AdminCategory>>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      categories.value = cached.list
      return cached
    }

    loading.value = true
    try {
      const result = await getAdminCategoryListApi(params)
      categories.value = result.list
      writeDisplayCache(cacheKey, result)
      return result
    } finally {
      loading.value = false
    }
  }

  /** 创建分类。 */
  async function createCategory(data: AdminCategoryPayload) {
    const created = await createAdminCategoryApi(data)
    categories.value = [created, ...categories.value]
    return created
  }

  /** 更新分类。 */
  async function updateCategory(id: number, data: Partial<AdminCategoryPayload>) {
    const updated = await updateAdminCategoryApi(id, data)
    categories.value = categories.value.map((item) => (item.id === id ? updated : item))
    return updated
  }

  /** 删除分类。 */
  async function deleteCategory(id: number) {
    await deleteAdminCategoryApi(id)
    categories.value = categories.value.filter((item) => item.id !== id)
  }

  /** 获取标签列表，供上传、筛选和标签管理使用。 */
  async function fetchTags(
    params: AdminTaxonomyListParams = { page: 1, pageSize: 80 },
    options: { force?: boolean } = {},
  ) {
    const cacheKey = createDisplayCacheKey('admin-tags', params)
    const cached = readDisplayCache<PageResult<AdminTag>>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      tags.value = cached.list
      return cached
    }

    loading.value = true
    try {
      const result = await getAdminTagListApi(params)
      tags.value = result.list
      writeDisplayCache(cacheKey, result)
      return result
    } finally {
      loading.value = false
    }
  }

  /** 创建标签。 */
  async function createTag(data: AdminTagPayload) {
    const created = await createAdminTagApi(data)
    tags.value = [created, ...tags.value]
    return created
  }

  /** 更新标签。 */
  async function updateTag(id: number, data: Partial<AdminTagPayload>) {
    const updated = await updateAdminTagApi(id, data)
    tags.value = tags.value.map((item) => (item.id === id ? updated : item))
    return updated
  }

  /** 删除标签。 */
  async function deleteTag(id: number) {
    await deleteAdminTagApi(id)
    tags.value = tags.value.filter((item) => item.id !== id)
  }

  /** 获取用户列表。 */
  async function fetchUsers(params: AdminUserListParams = { page: 1, pageSize: 9 }, options: { force?: boolean } = {}) {
    const cacheKey = createDisplayCacheKey('admin-users', params)
    const cached = readDisplayCache<PageResult<AdminUser>>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      users.value = cached.list
      userPagination.value = cached.pagination
      return cached
    }

    loading.value = true
    try {
      const result = await getAdminUserListApi(params)
      users.value = result.list
      userPagination.value = result.pagination
      writeDisplayCache(cacheKey, result)
      return result
    } finally {
      loading.value = false
    }
  }

  /** 禁用或恢复用户。 */
  async function updateUserStatus(id: number, status: 'normal' | 'disabled') {
    const updated = await updateAdminUserStatusApi(id, status)
    users.value = users.value.map((item) => (item.id === id ? updated : item))
    return updated
  }

  /** 软删除用户并从当前列表移除。 */
  async function deleteUser(id: number) {
    await deleteAdminUserApi(id)
    users.value = users.value.filter((item) => item.id !== id)
  }

  /** 获取管理员留言列表。 */
  async function fetchMessages(
    params: AdminMessageListParams = { page: 1, pageSize: 9 },
    options: { force?: boolean } = {},
  ) {
    const cacheKey = createDisplayCacheKey('admin-messages', params)
    const cached = readDisplayCache<PageResult<AdminMessage>>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      messages.value = cached.list
      messagePagination.value = cached.pagination
      return cached
    }

    loading.value = true
    try {
      const result = await getAdminMessageListApi(params)
      messages.value = result.list
      messagePagination.value = result.pagination
      writeDisplayCache(cacheKey, result)
      return result
    } finally {
      loading.value = false
    }
  }

  /** 获取留言详情和回复。 */
  async function fetchMessageDetail(id: number, options: { force?: boolean } = {}) {
    const cacheKey = createDisplayCacheKey('admin-message-detail', { id })
    const cached = readDisplayCache<AdminMessageDetail>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      messageDetail.value = cached
      return messageDetail.value
    }

    loading.value = true
    try {
      messageDetail.value = await getAdminMessageDetailApi(id)
      writeDisplayCache(cacheKey, messageDetail.value)
      return messageDetail.value
    } finally {
      loading.value = false
    }
  }

  /** 回复用户留言并刷新当前详情的回复列表。 */
  async function replyMessage(id: number, content: string) {
    const reply = await createAdminMessageReplyApi(id, content)
    if (messageDetail.value?.id === id) {
      messageDetail.value.replies = [...messageDetail.value.replies, reply]
    }
    return reply
  }

  /** 屏蔽留言，用户端和公开留言板将不再展示。 */
  async function blockMessage(id: number) {
    const blocked = await blockAdminMessageApi(id)
    messages.value = messages.value.filter((item) => item.id !== id)

    if (messageDetail.value?.id === id) {
      messageDetail.value = { ...messageDetail.value, ...blocked }
    }

    return blocked
  }

  return {
    loading,
    uploading,
    dashboardStats,
    logs,
    logPagination,
    images,
    imagePagination,
    categories,
    tags,
    users,
    userPagination,
    messages,
    messagePagination,
    messageDetail,
    fetchDashboardStats,
    fetchLogs,
    uploadImageFile,
    createImage,
    fetchImages,
    updateImage,
    updateImageStatus,
    deleteImage,
    restoreImage,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    fetchUsers,
    updateUserStatus,
    deleteUser,
    fetchMessages,
    fetchMessageDetail,
    replyMessage,
    blockMessage,
  }
})
