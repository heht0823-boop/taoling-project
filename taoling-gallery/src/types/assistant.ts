export type AssistantRole = 'user' | 'assistant' | 'system'

export interface AssistantConversation {
  id: number
  title: string
  created_at: string
  updated_at: string
}

export interface AssistantMessage {
  id: number
  role: AssistantRole
  content: string
  recommended_tags?: string[]
  recommended_image_ids?: number[]
  recommended_images?: AssistantRecommendedImage[]
  created_at: string
}

export interface AssistantChatParams {
  conversation_id?: number
  message?: string
  stream?: boolean
}

export interface AssistantRecommendedImage {
  id: number
  title: string
  thumbnail_url?: string
  image_url?: string
  detail_url?: string
  is_favorited?: boolean
}

export interface AssistantChatResult {
  conversation_id: number
  title?: string
  reply?: string
  recommended_tags?: string[]
  recommended_images?: AssistantRecommendedImage[]
  tool_results?: unknown[]
}

export interface AssistantStreamStart {
  conversation_id: number
  title?: string
  is_new?: boolean
  default_stream?: boolean
}

export interface AssistantStreamError {
  code?: number
  message?: string
  data?: unknown
}

export interface AssistantStreamHandlers {
  onStart?: (payload: AssistantStreamStart) => void
  onDelta?: (delta: string) => void
  onTools?: (payload: unknown) => void
  onDone?: (payload: AssistantChatResult) => void
  onError?: (payload: AssistantStreamError) => void
}

export interface CreateConversationParams {
  title?: string
}
