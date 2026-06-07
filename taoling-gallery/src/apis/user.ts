import { requestData } from '@/utils/request'
import type { MeResult } from '@/types/auth'
import type {
  AvatarUpdateResult,
  CreateUserMessageParams,
  CreateUserMessageResult,
  UserMessage,
  UserMessageListParams,
} from '@/types/message'
import type { PageResult } from '@/types/common'

export interface UpdateProfileParams {
  username?: string
  email?: string
  avatar_url?: string
}

/** 获取用户中心概览，包含用户资料和统计数据。 */
export function getProfileSummaryApi() {
  return requestData<MeResult>({
    url: '/user/profile/summary',
    method: 'GET',
  })
}

/** 更新当前登录用户资料。 */
export function updateProfileApi(data: UpdateProfileParams) {
  return requestData<MeResult>({
    url: '/user/profile',
    method: 'PUT',
    data,
  })
}

/** 上传本地头像文件。 */
export function uploadAvatarFileApi(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return requestData<AvatarUpdateResult>({
    url: '/user/profile/avatar',
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    showError: false,
  })
}

/** 获取当前用户留言列表。 */
export function getUserMessagesApi(params: UserMessageListParams = { page: 1, pageSize: 8 }) {
  return requestData<PageResult<UserMessage>>({
    url: '/user/messages',
    method: 'GET',
    params,
  })
}

/** 创建留言，后端会先写入 pending，再根据文本审核结果更新状态。 */
export function createUserMessageApi(data: CreateUserMessageParams) {
  return requestData<CreateUserMessageResult>({
    url: '/user/messages',
    method: 'POST',
    data,
    showError: false,
  })
}
