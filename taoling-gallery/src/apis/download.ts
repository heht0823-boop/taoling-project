import { requestData } from '@/utils/request'
import type { PageResult } from '@/types/common'
import type { DownloadListParams, DownloadRecord, DownloadResult } from '@/types/download'

/** 创建图片下载记录并返回下载地址。 */
export function createDownloadApi(imageId: number) {
  return requestData<DownloadResult>({
    url: `/images/${imageId}/download`,
    method: 'POST',
  })
}

/** 获取我的下载记录。 */
export function getDownloadListApi(params: DownloadListParams) {
  return requestData<PageResult<DownloadRecord>>({
    url: '/user/downloads',
    method: 'GET',
    params,
  })
}

/** 删除单条下载记录。 */
export function deleteDownloadRecordApi(recordId: number) {
  return requestData<Record<string, never>>({
    url: `/user/downloads/${recordId}`,
    method: 'DELETE',
  })
}

/** 清空全部下载记录。 */
export function clearDownloadRecordsApi() {
  return requestData<Record<string, never>>({
    url: '/user/downloads',
    method: 'DELETE',
  })
}
