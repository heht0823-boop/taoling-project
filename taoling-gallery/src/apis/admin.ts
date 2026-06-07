import { requestData } from '@/utils/request'
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
  AdminUploadedImage,
  AdminUser,
  AdminUserListParams,
} from '@/types/admin'
import type { PageResult } from '@/types/common'
import type {
  AdminMessage,
  AdminMessageDetail,
  AdminMessageListParams,
} from '@/types/message'

/** 获取管理中心统计数据。 */
export function getDashboardStatsApi() {
  return requestData<AdminDashboardStats>({
    url: '/admin/dashboard/stats',
    method: 'GET',
  })
}

/** 获取管理员操作日志。 */
export function getAdminLogsApi(params: AdminLogListParams) {
  return requestData<PageResult<AdminLog>>({
    url: '/admin/logs',
    method: 'GET',
    params,
  })
}

/** 上传图片文件到后端文件服务，通常由上传页在 WebP 转换后调用。 */
export function uploadAdminImageFileApi(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return requestData<AdminUploadedImage>({
    url: '/admin/files/images',
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 创建管理员图库图片记录。 */
export function createAdminImageApi(data: AdminImagePayload) {
  return requestData<AdminImage>({
    url: '/admin/images',
    method: 'POST',
    data,
  })
}

/** 获取管理员图片列表。 */
export function getAdminImageListApi(params: AdminImageListParams) {
  return requestData<PageResult<AdminImage>>({
    url: '/admin/images',
    method: 'GET',
    params,
  })
}

/** 更新图片基础信息。 */
export function updateAdminImageApi(id: number, data: AdminImageUpdatePayload) {
  return requestData<AdminImage>({
    url: `/admin/images/${id}`,
    method: 'PUT',
    data,
  })
}

/** 修改图片公开状态。 */
export function updateAdminImageStatusApi(id: number, status: AdminImageStatus) {
  return requestData<AdminImage>({
    url: `/admin/images/${id}/status`,
    method: 'PATCH',
    data: { status },
  })
}

/** 软删除图片。 */
export function deleteAdminImageApi(id: number) {
  return requestData<Record<string, never>>({
    url: `/admin/images/${id}`,
    method: 'DELETE',
  })
}

/** 恢复已删除图片。 */
export function restoreAdminImageApi(id: number, status: Exclude<AdminImageStatus, 'deleted'> = 'draft') {
  return requestData<AdminImage>({
    url: `/admin/images/${id}/restore`,
    method: 'PATCH',
    data: { status },
  })
}

/** 获取管理员分类列表。 */
export function getAdminCategoryListApi(params: AdminTaxonomyListParams = {}) {
  return requestData<PageResult<AdminCategory>>({
    url: '/admin/categories',
    method: 'GET',
    params,
  })
}

/** 创建图库分类。 */
export function createAdminCategoryApi(data: AdminCategoryPayload) {
  return requestData<AdminCategory>({
    url: '/admin/categories',
    method: 'POST',
    data,
  })
}

/** 更新图库分类。 */
export function updateAdminCategoryApi(id: number, data: Partial<AdminCategoryPayload>) {
  return requestData<AdminCategory>({
    url: `/admin/categories/${id}`,
    method: 'PUT',
    data,
  })
}

/** 删除图库分类。 */
export function deleteAdminCategoryApi(id: number) {
  return requestData<Record<string, never>>({
    url: `/admin/categories/${id}`,
    method: 'DELETE',
  })
}

/** 获取管理员标签列表。 */
export function getAdminTagListApi(params: AdminTaxonomyListParams = {}) {
  return requestData<PageResult<AdminTag>>({
    url: '/admin/tags',
    method: 'GET',
    params,
  })
}

/** 创建图库标签。 */
export function createAdminTagApi(data: AdminTagPayload) {
  return requestData<AdminTag>({
    url: '/admin/tags',
    method: 'POST',
    data,
  })
}

/** 更新图库标签。 */
export function updateAdminTagApi(id: number, data: Partial<AdminTagPayload>) {
  return requestData<AdminTag>({
    url: `/admin/tags/${id}`,
    method: 'PUT',
    data,
  })
}

/** 删除图库标签。 */
export function deleteAdminTagApi(id: number) {
  return requestData<Record<string, never>>({
    url: `/admin/tags/${id}`,
    method: 'DELETE',
  })
}

/** 获取管理员用户列表。 */
export function getAdminUserListApi(params: AdminUserListParams) {
  return requestData<PageResult<AdminUser>>({
    url: '/admin/users',
    method: 'GET',
    params,
  })
}

/** 禁用或恢复用户账号。 */
export function updateAdminUserStatusApi(id: number, status: 'normal' | 'disabled') {
  return requestData<AdminUser>({
    url: `/admin/users/${id}/status`,
    method: 'PATCH',
    data: { status },
  })
}

/** 软删除用户账号。 */
export function deleteAdminUserApi(id: number) {
  return requestData<Record<string, never>>({
    url: `/admin/users/${id}`,
    method: 'DELETE',
  })
}

/** 获取管理员留言列表，支持审核状态、关键词和用户筛选。 */
export function getAdminMessageListApi(params: AdminMessageListParams) {
  return requestData<PageResult<AdminMessage>>({
    url: '/admin/messages',
    method: 'GET',
    params,
  })
}

/** 获取留言详情及管理员回复列表。 */
export function getAdminMessageDetailApi(id: number) {
  return requestData<AdminMessageDetail>({
    url: `/admin/messages/${id}`,
    method: 'GET',
  })
}

/** 管理员回复用户留言。 */
export function createAdminMessageReplyApi(id: number, content: string) {
  return requestData<AdminMessage>({
    url: `/admin/messages/${id}/replies`,
    method: 'POST',
    data: { content },
  })
}

/** 屏蔽留言，只将审核状态改为 block。 */
export function blockAdminMessageApi(id: number) {
  return requestData<AdminMessage>({
    url: `/admin/messages/${id}`,
    method: 'DELETE',
  })
}
