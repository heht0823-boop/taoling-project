import { requestData } from '@/utils/request'
import type { PageResult } from '@/types/common'
import type { PublicMessage, PublicMessageListParams } from '@/types/message'

/** 获取公开留言板，只返回审核通过的顶级留言和已通过回复。 */
export function getPublicMessagesApi(params: PublicMessageListParams = { page: 1, pageSize: 24 }) {
  return requestData<PageResult<PublicMessage>>({
    url: '/messages',
    method: 'GET',
    params,
  })
}
