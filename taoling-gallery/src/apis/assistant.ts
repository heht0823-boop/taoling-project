import { requestData } from '@/utils/request'
import type {
  AssistantChatParams,
  AssistantChatResult,
  AssistantConversation,
  AssistantMessage,
  AssistantStreamHandlers,
  CreateConversationParams,
} from '@/types/assistant'
import type { ApiResponse } from '@/types/common'

function getApiUrl(path: string, searchParams?: URLSearchParams) {
  const baseUrl = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const url = `${baseUrl}${path}`
  const search = searchParams?.toString()
  return search ? `${url}?${search}` : url
}

function parseEventData<T>(value: string): T | null {
  if (!value || value === '[DONE]') {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

/** 获取当前用户的桃灵助手会话列表。 */
export function getConversationListApi() {
  return requestData<AssistantConversation[]>({
    url: '/ai/conversations',
    method: 'GET',
  })
}

/** 创建新的桃灵助手会话。 */
export function createConversationApi(data: CreateConversationParams = {}) {
  return requestData<AssistantConversation>({
    url: '/ai/conversations',
    method: 'POST',
    data,
  })
}

/** 获取指定会话内的历史消息。 */
export function getConversationMessagesApi(id: number) {
  return requestData<AssistantMessage[]>({
    url: `/ai/conversations/${id}/messages`,
    method: 'GET',
  })
}

/** 向桃灵助手发送流式消息；后端默认返回 SSE。 */
export async function sendAssistantMessageStreamApi(
  data: AssistantChatParams,
  handlers: AssistantStreamHandlers = {},
) {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  const response = await fetch(getApiUrl('/ai/chat'), {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      ...data,
      stream: data.stream ?? true,
    }),
  })

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as ApiResponse | null
    throw new Error(result?.message || '桃灵助手暂时没有回应')
  }

  if (!response.body) {
    throw new Error('当前浏览器暂不支持流式回复')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let eventName = 'message'

  function dispatchEvent(name: string, rawData: string) {
    const dataValue = rawData.trim()

    if (!dataValue) {
      return
    }

    if (name === 'start') {
      const payload =
        parseEventData<Parameters<NonNullable<AssistantStreamHandlers['onStart']>>[0]>(dataValue)
      if (payload) handlers.onStart?.(payload)
      return
    }

    if (name === 'delta' || name === 'message') {
      const payload = parseEventData<{ delta?: string }>(dataValue)
      if (payload?.delta) handlers.onDelta?.(payload.delta)
      return
    }

    if (name === 'tools') {
      const payload = parseEventData<unknown>(dataValue)
      if (payload) handlers.onTools?.(payload)
      return
    }

    if (name === 'done') {
      const payload = parseEventData<AssistantChatResult>(dataValue)
      if (payload) handlers.onDone?.(payload)
      return
    }

    if (name === 'error') {
      const payload =
        parseEventData<Parameters<NonNullable<AssistantStreamHandlers['onError']>>[0]>(dataValue)
      handlers.onError?.(payload || { message: '桃灵助手回复失败' })
    }
  }

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split(/\r?\n\r?\n/)
    buffer = events.pop() || ''

    for (const eventBlock of events) {
      const dataLines: string[] = []
      eventName = 'message'

      for (const line of eventBlock.split(/\r?\n/)) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim()
        }

        if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim())
        }
      }

      dispatchEvent(eventName, dataLines.join('\n'))
    }
  }

  if (buffer.trim()) {
    const dataLines: string[] = []

    for (const line of buffer.split(/\r?\n/)) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim()
      }

      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim())
      }
    }

    dispatchEvent(eventName, dataLines.join('\n'))
  }
}

/** 向桃灵助手发送非流式消息，仅作为流式失败后的兜底。 */
export function sendAssistantMessageApi(data: AssistantChatParams) {
  const params = new URLSearchParams({ stream: 'false' })
  return requestData<AssistantChatResult>({
    url: `/ai/chat?${params.toString()}`,
    method: 'POST',
    showError: false,
    data: {
      ...data,
      stream: false,
    },
  })
}

/** 删除单个桃灵助手会话。 */
export function deleteConversationApi(id: number) {
  return requestData<Record<string, never>>({
    url: `/ai/conversations/${id}`,
    method: 'DELETE',
  })
}

/** 清空当前用户的全部桃灵助手会话。 */
export function clearConversationsApi() {
  return requestData<Record<string, never>>({
    url: '/ai/conversations',
    method: 'DELETE',
  })
}
