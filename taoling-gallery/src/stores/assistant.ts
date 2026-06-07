import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  clearConversationsApi,
  createConversationApi,
  deleteConversationApi,
  getConversationListApi,
  getConversationMessagesApi,
  sendAssistantMessageApi,
  sendAssistantMessageStreamApi,
} from '@/apis/assistant'
import type {
  AssistantChatResult,
  AssistantConversation,
  AssistantMessage,
} from '@/types/assistant'
import {
  createDisplayCacheKey,
  readDisplayCache,
  shouldRefreshForBrowserReload,
  writeDisplayCache,
} from '@/utils/displayCache'

export const useAssistantStore = defineStore('assistant', () => {
  const conversations = ref<AssistantConversation[]>([])
  const currentConversation = ref<AssistantConversation | null>(null)
  const messages = ref<AssistantMessage[]>([])
  const latestResult = ref<AssistantChatResult | null>(null)
  const loading = ref(false)
  const sending = ref(false)
  const error = ref('')

  const hasConversations = computed(() => conversations.value.length > 0)

  function getMessagesCacheKey(conversationId: number) {
    return createDisplayCacheKey('assistant-messages', { id: conversationId })
  }

  function cacheCurrentMessages() {
    const id = currentConversation.value?.id

    if (id) {
      writeDisplayCache(getMessagesCacheKey(id), messages.value)
    }
  }

  function upsertConversation(conversation: AssistantConversation) {
    const existing = conversations.value.find((item) => item.id === conversation.id)

    if (existing) {
      existing.title = conversation.title || existing.title
      existing.updated_at = conversation.updated_at || existing.updated_at
      currentConversation.value = existing
      return existing
    }

    conversations.value = [conversation, ...conversations.value]
    currentConversation.value = conversation
    return conversation
  }

  function applyChatResult(result: AssistantChatResult, assistantMessageId: number) {
    latestResult.value = result

    messages.value = messages.value.map((item) => {
      if (item.id !== assistantMessageId) {
        return item
      }

      return {
        ...item,
        content: result.reply || item.content || '桃灵已经收到啦，但这次回复有点轻，请再试一次。',
        recommended_tags: result.recommended_tags,
        recommended_images: result.recommended_images,
      }
    })

    const conversationTitle = result.title || '新的对话'
    const matched = conversations.value.find((item) => item.id === result.conversation_id)

    if (matched) {
      matched.title = conversationTitle || matched.title
      matched.updated_at = new Date().toISOString()
      currentConversation.value = matched
    } else {
      upsertConversation({
        id: result.conversation_id,
        title: conversationTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    cacheCurrentMessages()
  }

  /** 获取桃灵助手会话列表，并默认选中最近一个会话。 */
  async function fetchConversations(options: { force?: boolean } = {}) {
    const cacheKey = createDisplayCacheKey('assistant-conversations')
    const cached = readDisplayCache<AssistantConversation[]>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      conversations.value = cached
      const firstConversation = conversations.value[0]

      if (!currentConversation.value && firstConversation) {
        await selectConversation(firstConversation.id)
      }

      return conversations.value
    }

    loading.value = true
    error.value = ''

    try {
      conversations.value = await getConversationListApi()
      writeDisplayCache(cacheKey, conversations.value)

      const firstConversation = conversations.value[0]

      if (!currentConversation.value && firstConversation) {
        await selectConversation(firstConversation.id)
      }

      return conversations.value
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '会话加载失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  /** 创建一个新的桃灵助手会话并切换过去。 */
  async function createConversation(title = '新的对话') {
    loading.value = true
    error.value = ''

    try {
      const conversation = await createConversationApi({ title })
      conversations.value = [
        conversation,
        ...conversations.value.filter((item) => item.id !== conversation.id),
      ]
      currentConversation.value = conversation
      messages.value = []
      latestResult.value = null
      return conversation
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '创建会话失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  /** 切换会话并读取对应历史消息。 */
  async function selectConversation(id: number, options: { force?: boolean } = {}) {
    const conversation = conversations.value.find((item) => item.id === id) || null
    currentConversation.value = conversation
    latestResult.value = null

    if (!conversation) {
      messages.value = []
      return []
    }

    const cacheKey = getMessagesCacheKey(id)
    const cached = readDisplayCache<AssistantMessage[]>(cacheKey)
    if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
      messages.value = cached
      return messages.value
    }

    loading.value = true
    error.value = ''

    try {
      messages.value = await getConversationMessagesApi(id)
      writeDisplayCache(cacheKey, messages.value)
      return messages.value
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '消息加载失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  /** 发送用户消息，默认走 SSE 流式；失败时才显式使用非流式兜底。 */
  async function sendMessage(content: string) {
    const message = content.trim()

    if (!message) {
      return null
    }

    sending.value = true
    error.value = ''

    const userMessage: AssistantMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    }
    const assistantMessageId = Date.now() + 1
    const assistantMessage: AssistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    }

    messages.value = [...messages.value, userMessage, assistantMessage]
    cacheCurrentMessages()

    try {
      const chatParams = {
        conversation_id: currentConversation.value?.id,
        message,
      }
      let streamResult: AssistantChatResult | null = null
      let streamError: Error | null = null

      await sendAssistantMessageStreamApi(chatParams, {
        onStart(payload) {
          upsertConversation({
            id: payload.conversation_id,
            title: payload.title || '新的对话',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          cacheCurrentMessages()
        },
        onDelta(delta) {
          messages.value = messages.value.map((item) =>
            item.id === assistantMessageId
              ? {
                  ...item,
                  content: `${item.content}${delta}`,
                }
              : item,
          )
        },
        onDone(result) {
          streamResult = result
          applyChatResult(result, assistantMessageId)
        },
        onError(payload) {
          streamError = new Error(payload.message || '桃灵助手回复失败')
        },
      })

      if (streamError) {
        throw streamError
      }

      if (!streamResult) {
        throw new Error('桃灵助手流式回复中断')
      }

      await fetchConversations({ force: true })
      currentConversation.value =
        conversations.value.find((item) => item.id === streamResult?.conversation_id) ||
        currentConversation.value
      return streamResult
    } catch (requestError) {
      try {
        const fallback = await sendAssistantMessageApi({
          conversation_id: currentConversation.value?.id,
          message,
        })
        applyChatResult(fallback, assistantMessageId)
        await fetchConversations({ force: true })
        currentConversation.value =
          conversations.value.find((item) => item.id === fallback.conversation_id) ||
          currentConversation.value
        return fallback
      } catch (fallbackError) {
        const messageText =
          fallbackError instanceof Error
            ? fallbackError.message
            : requestError instanceof Error
              ? requestError.message
              : '消息发送失败'
        error.value = messageText
        messages.value = messages.value.map((item) =>
          item.id === assistantMessageId
            ? {
                ...item,
                content: '桃灵暂时没有连上服务，请稍后再试一次。',
              }
            : item,
        )
        cacheCurrentMessages()
        throw fallbackError
      }
    } finally {
      sending.value = false
    }
  }

  /** 删除一个会话，删除后自动切换到最新会话或空状态。 */
  async function deleteConversation(id: number) {
    loading.value = true
    error.value = ''

    try {
      await deleteConversationApi(id)
      conversations.value = conversations.value.filter((item) => item.id !== id)

      if (currentConversation.value?.id === id) {
        currentConversation.value = null
        messages.value = []
        latestResult.value = null

        const firstConversation = conversations.value[0]

        if (firstConversation) {
          await selectConversation(firstConversation.id)
        }
      }
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '删除会话失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  /** 清空全部会话和当前消息。 */
  async function clearConversations() {
    loading.value = true
    error.value = ''

    try {
      await clearConversationsApi()
      conversations.value = []
      currentConversation.value = null
      messages.value = []
      latestResult.value = null
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : '清空会话失败'
      throw requestError
    } finally {
      loading.value = false
    }
  }

  return {
    conversations,
    currentConversation,
    messages,
    latestResult,
    loading,
    sending,
    error,
    hasConversations,
    fetchConversations,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    clearConversations,
  }
})
