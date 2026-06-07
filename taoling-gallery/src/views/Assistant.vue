<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  Clock,
  Delete,
  MoreFilled,
  Plus,
  Promotion,
  RefreshRight,
  Search,
  Star,
} from '@element-plus/icons-vue'

import { clickGuard } from '@/utils/perform'
import TaolingMascot from '@/components/business/TaolingMascot.vue'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import { useAssistantStore } from '@/stores/assistant'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import type {
  AssistantConversation,
  AssistantMessage,
  AssistantRecommendedImage,
} from '@/types/assistant'
import { getAspectRatioSize, resolveImageUrl } from '@/utils/image'

const assistantStore = useAssistantStore()
const userStore = useUserStore()
const router = useRouter()
const inputText = ref('')
const messageListRef = ref<HTMLElement>()
const clearVisible = ref(false)
const deleteVisible = ref(false)
const loginVisible = ref(false)
const pendingDelete = ref<AssistantConversation | null>(null)

const quickPrompts = [
  { icon: Star, text: '帮我看看热门图片' },
  { icon: Clock, text: '查找最新发布的图片' },
  { icon: Search, text: '帮我找治愈系插画' },
]
const chatImageSize = getAspectRatioSize('4:3', 320)

const greetingMessage = computed<AssistantMessage>(() => ({
  id: 0,
  role: 'assistant' as const,
  content: '你好呀！我是桃灵，你的私人图库小助手。今天想寻找什么样的灵感呢？',
  recommended_tags: [],
  created_at: '',
}))

const visibleMessages = computed(() => {
  if (assistantStore.messages.length) {
    return assistantStore.messages
  }

  return [greetingMessage.value]
})

const canSubmit = computed(() => !assistantStore.sending && !!inputText.value.trim())

/** 当前对话是否还未发送过消息（新建的空对话）。 */
const isCurrentConversationEmpty = computed(
  () => !!assistantStore.currentConversation && assistantStore.messages.length === 0,
)

function requireLogin(): boolean {
  if (userStore.isLoggedIn) return true
  loginVisible.value = true
  return false
}

async function goLogin() {
  loginVisible.value = false
  await router.push('/auth')
}

async function scrollToBottom() {
  await nextTick()
  messageListRef.value?.scrollTo({
    top: messageListRef.value.scrollHeight,
    behavior: 'smooth',
  })
}

async function loadAssistant() {
  if (!userStore.isLoggedIn) return

  try {
    await assistantStore.fetchConversations()
    await scrollToBottom()
  } catch {
    ElMessage.error('桃灵助手加载失败，请稍后再试')
  }
}

async function refreshAssistant() {
  if (!requireLogin()) return

  try {
    await assistantStore.fetchConversations({ force: true })
    await scrollToBottom()
  } catch {
    ElMessage.error('桃灵助手刷新失败，请稍后再试')
  }
}

const createNewConversation = clickGuard(async () => {
  if (!requireLogin()) return
  if (isCurrentConversationEmpty.value) {
    return
  }

  try {
    await assistantStore.createConversation()
    await scrollToBottom()
  } catch {
    ElMessage.error('创建会话失败，请稍后再试')
  }
})

async function selectConversation(id: number) {
  try {
    await assistantStore.selectConversation(id)
    await scrollToBottom()
  } catch {
    ElMessage.error('历史消息加载失败')
  }
}

const submitMessage = clickGuard(async () => {
  if (!requireLogin()) return
  const content = inputText.value.trim()

  if (!canSubmit.value) {
    return
  }

  inputText.value = ''

  try {
    await assistantStore.sendMessage(content)
    await scrollToBottom()
  } catch {
    ElMessage.error('消息发送失败，桃灵稍后再陪你试一次')
  }
})

const useQuickPrompt = clickGuard(async (text: string) => {
  if (!requireLogin()) return
  inputText.value = text
  await submitMessage()
})

function openRecommendedImage(image: AssistantRecommendedImage) {
  void router.push(image.detail_url || `/images/${image.id}`)
}

function getRecommendedImageSrc(image: AssistantRecommendedImage) {
  return resolveImageUrl(image.thumbnail_url || image.image_url)
}

function openDeleteDialog(conversation: AssistantConversation) {
  pendingDelete.value = conversation
  deleteVisible.value = true
}

async function confirmDeleteConversation() {
  if (!pendingDelete.value) {
    return
  }

  try {
    await assistantStore.deleteConversation(pendingDelete.value.id)
    ElMessage.success('已删除这段灵感对话')
  } catch {
    ElMessage.error('删除会话失败')
  } finally {
    deleteVisible.value = false
    pendingDelete.value = null
  }
}

async function confirmClearConversations() {
  try {
    await assistantStore.clearConversations()
    ElMessage.success('桃灵已经清空历史会话')
  } catch {
    ElMessage.error('清空会话失败')
  } finally {
    clearVisible.value = false
  }
}

function formatDate(value: string) {
  if (!value) {
    return '刚刚'
  }

  return new Date(value).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  void loadAssistant()
})
</script>

<template>
  <section class="assistant-view">
    <div class="assistant-shell">
      <aside class="conversation-panel">
        <div class="panel-heading">
          <div class="panel-title">
            <span class="soft-label">Taoling Assistant</span>
            <h1>灵感会话</h1>
          </div>
          <div class="panel-tools">
            <button
              class="icon-button"
              type="button"
              aria-label="新建会话"
              @click="createNewConversation"
            >
              <ElIcon><Plus /></ElIcon>
            </button>
            <button
              class="icon-button"
              type="button"
              aria-label="刷新会话"
              @click="refreshAssistant"
            >
              <ElIcon><RefreshRight /></ElIcon>
            </button>
          </div>
        </div>

        <button class="new-chat" type="button" @click="createNewConversation">
          <ElIcon><ChatDotRound /></ElIcon>
          新的灵感对话
        </button>

        <div class="history-box" :class="{ 'has-conversations': assistantStore.hasConversations }">
          <div
            v-if="!assistantStore.hasConversations && !assistantStore.loading"
            class="conversation-empty"
          >
            <div class="empty-mascot">
              <TaolingMascot state="sleepy" :autoplay="false" size="sm" />
            </div>
            <p>还没有历史会话</p>
          </div>

          <div v-else-if="assistantStore.loading" class="list-loading">正在唤醒桃灵...</div>

          <div v-else class="conversation-list">
            <button
              v-for="conversation in assistantStore.conversations"
              :key="conversation.id"
              class="conversation-item"
              :class="{ 'is-active': assistantStore.currentConversation?.id === conversation.id }"
              type="button"
              @click="selectConversation(conversation.id)"
            >
              <span class="conversation-title">{{ conversation.title || '新的灵感对话' }}</span>
              <span class="conversation-date">{{ formatDate(conversation.updated_at) }}</span>
              <span class="delete-conversation" @click.stop="openDeleteDialog(conversation)">
                <ElIcon><Delete /></ElIcon>
              </span>
            </button>
          </div>
        </div>

        <button
          class="clear-button"
          type="button"
          :disabled="!assistantStore.hasConversations"
          @click="clearVisible = true"
        >
          清空历史
        </button>
      </aside>

      <main class="chat-card">
        <header class="chat-header">
          <div class="assistant-mascot-stage">
            <TaolingMascot state="welcome" autoplay priority size="sm" />
          </div>
          <div class="assistant-copy">
            <span class="status-pill">在线 · 你的灵感导航员</span>
            <h2>桃灵助手</h2>
            <p>把想找的画面、风格、用途告诉桃灵，一起从图库里找到灵感。</p>
          </div>
          <button
            class="more-button"
            type="button"
            aria-label="更多操作"
            @click="clearVisible = true"
          >
            <ElIcon><MoreFilled /></ElIcon>
          </button>
        </header>

        <div ref="messageListRef" class="message-list">
          <div
            v-for="message in visibleMessages"
            :key="message.id"
            class="message-row"
            :class="message.role === 'user' ? 'is-user' : 'is-assistant'"
          >
            <div v-if="message.role !== 'user'" class="message-mascot">
              <TaolingMascot state="happy" autoplay size="sm" />
            </div>
            <div class="message-bubble">
              <p v-if="message.content">{{ message.content }}</p>
              <div
                v-else-if="message.role === 'assistant' && assistantStore.sending"
                class="inline-typing"
              >
                <i />
                <i />
                <i />
              </div>
              <div v-if="message.recommended_tags?.length" class="recommend-tags">
                <span v-for="tag in message.recommended_tags" :key="tag">{{ tag }}</span>
              </div>
              <div v-if="message.recommended_images?.length" class="recommend-images">
                <article
                  v-for="image in message.recommended_images"
                  :key="image.id"
                  role="button"
                  tabindex="0"
                  @click="openRecommendedImage(image)"
                  @keydown.enter="openRecommendedImage(image)"
                >
                  <img
                    :src="getRecommendedImageSrc(image)"
                    :alt="image.title"
                    :width="chatImageSize.width"
                    :height="chatImageSize.height"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{{ image.title }}</span>
                </article>
              </div>
            </div>
          </div>
        </div>

        <div class="composer-area">
          <div class="quick-actions">
            <button
              v-for="item in quickPrompts"
              :key="item.text"
              type="button"
              @click="useQuickPrompt(item.text)"
            >
              <ElIcon><component :is="item.icon" /></ElIcon>
              {{ item.text }}
            </button>
          </div>

          <form class="chat-input" @submit.prevent="submitMessage">
            <input
              v-model="inputText"
              placeholder="描述想找的图片，让桃灵帮你一起寻找灵感..."
              :disabled="assistantStore.sending"
            />
            <button class="send-button" type="submit" aria-label="发送消息" :disabled="!canSubmit">
              <ElIcon><Promotion /></ElIcon>
            </button>
          </form>
        </div>
      </main>
    </div>

    <ConfirmDialog
      v-model="deleteVisible"
      danger
      title="删除这段会话吗？"
      description="删除后这段灵感记录会从列表中移除。"
      confirm-text="删除"
      cancel-text="保留"
      :loading="assistantStore.loading"
      @confirm="confirmDeleteConversation"
    />

    <ConfirmDialog
      v-model="clearVisible"
      danger
      title="清空全部历史吗？"
      description="桃灵会清空当前账号下的全部助手会话记录。"
      confirm-text="清空"
      cancel-text="取消"
      :loading="assistantStore.loading"
      @confirm="confirmClearConversations"
    />

    <ConfirmDialog
      v-model="loginVisible"
      title="登录后使用桃灵助手"
      description="登录后可以创建对话、发送消息、查看历史会话。先用游客身份逛逛图库吧。"
      confirm-text="前往登录"
      cancel-text="我先逛逛"
      @confirm="goLogin"
      @cancel="loginVisible = false"
    />
  </section>
</template>

<style scoped lang="scss">
.assistant-view {
  position: relative;
  min-height: calc(100vh - 112px);
  padding: 126px clamp(20px, 5vw, 68px) 52px;
  overflow: hidden;
  background:
    radial-gradient(circle at 8% 0%, rgba(255, 170, 203, 0.24), transparent 30%),
    radial-gradient(circle at 92% 10%, rgba(197, 182, 255, 0.24), transparent 34%),
    linear-gradient(180deg, #fff9fb 0%, #fff1f7 100%);
}

.assistant-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(286px, 336px) minmax(0, 1fr);
  gap: 24px;
  width: min(1280px, 100%);
  height: clamp(620px, calc(100vh - 174px), 760px);
  margin: 0 auto;
}

.conversation-panel,
.chat-card {
  min-height: 0;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.88);
  box-shadow: 0 24px 62px rgba(161, 72, 120, 0.1);
  backdrop-filter: blur(18px);
}

.conversation-panel {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 18px;
  padding: 26px;
  border-radius: 34px;
}

.panel-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
}

.panel-title {
  min-width: 0;

  h1 {
    margin: 10px 0 0;
    color: $color-text-main;
    font-size: 30px;
    font-weight: 700;
    line-height: 1.1;
  }
}

.soft-label,
.status-pill {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 28px;
  padding: 0 12px;
  border-radius: $radius-pill;
}

.soft-label {
  color: $color-primary;
  font-size: 12px;
  background: rgba(255, 241, 247, 0.88);
  border: 1px solid rgba(244, 139, 181, 0.2);
}

.panel-tools {
  display: inline-flex;
  gap: 12px;
}

.icon-button,
.more-button,
.send-button {
  display: grid;
  place-items: center;
  cursor: pointer;
  border: 0;
  border-radius: 50%;
}

.icon-button {
  width: 44px;
  height: 44px;
  color: $color-text-white;
  font-size: 18px;
  background: $gradient-primary;
  box-shadow: $shadow-button;
}

.new-chat {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  color: $color-text-white;
  font-size: 15px;
  cursor: pointer;
  background: $gradient-primary;
  border: 0;
  border-radius: $radius-pill;
  box-shadow: $shadow-button;
}

.history-box {
  min-height: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 48%, rgba(255, 220, 233, 0.5), transparent 42%),
    rgba(255, 252, 254, 0.54);
  border: 1px solid rgba(244, 139, 181, 0.11);
  border-radius: 26px;

  &.has-conversations {
    padding: 12px;
  }
}

.conversation-empty {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 18px;
  color: $color-text-light;

  p {
    margin: 10px 0 0;
    font-size: 14px;
  }
}

.empty-mascot {
  display: grid;
  width: 118px;
  height: 118px;
  place-items: center;

  :deep(.taoling-mascot) {
    --mascot-size: 112px;
  }
}

.conversation-list {
  display: flex;
  max-height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.conversation-item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 10px;
  min-height: 66px;
  padding: 13px 42px 13px 14px;
  text-align: left;
  cursor: pointer;
  background: rgba(255, 246, 250, 0.74);
  border: 1px solid rgba(161, 72, 120, 0.08);
  border-radius: 18px;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &.is-active,
  &:hover {
    background: rgba(255, 229, 239, 0.9);
    transform: translateY(-1px);
  }
}

.conversation-title {
  overflow: hidden;
  color: $color-text-main;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.conversation-date {
  color: $color-text-light;
  font-size: 12px;
}

.delete-conversation {
  position: absolute;
  top: 18px;
  right: 12px;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  color: $color-text-light;
  border-radius: 50%;

  &:hover {
    color: $color-primary;
    background: rgba(255, 255, 255, 0.84);
  }
}

.list-loading {
  display: grid;
  min-height: 100%;
  place-items: center;
  color: $color-text-light;
  font-size: 14px;
}

.clear-button {
  min-height: 44px;
  color: $color-primary;
  cursor: pointer;
  background: rgba(255, 244, 248, 0.82);
  border: 1px solid rgba(244, 139, 181, 0.18);
  border-radius: $radius-pill;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.52;
  }
}

.chat-card {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border-radius: 34px;
}

.chat-header {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  min-height: 124px;
  padding: 18px 30px;
  background: rgba(255, 255, 255, 0.66);
  border-bottom: 1px solid rgba(161, 72, 120, 0.1);
}

.assistant-mascot-stage {
  position: relative;
  display: grid;
  width: 112px;
  height: 112px;
  place-items: center;

  &::before {
    position: absolute;
    inset: 14px;
    z-index: 0;
    content: '';
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(244, 139, 181, 0.1);
    border-radius: 50%;
    box-shadow: 0 16px 34px rgba(161, 72, 120, 0.1);
  }

  :deep(.taoling-mascot) {
    --mascot-size: 112px;

    z-index: 1;
  }
}

.assistant-copy {
  min-width: 0;

  h2 {
    margin: 6px 0 4px;
    color: $color-primary;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.1;
  }

  p {
    max-width: 560px;
    margin: 0;
    color: $color-text-secondary;
    font-size: 14px;
    line-height: 1.7;
  }
}

.status-pill {
  color: #1681b7;
  font-size: 13px;
  background: rgba(223, 243, 255, 0.72);
  border: 1px solid rgba(158, 220, 255, 0.42);
}

.more-button {
  width: 40px;
  height: 40px;
  color: $color-primary-light;
  background: rgba(255, 246, 250, 0.86);
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
  overflow-y: auto;
  padding: 28px 34px;
  background:
    radial-gradient(circle at 24% 12%, rgba(255, 221, 232, 0.36), transparent 32%),
    linear-gradient(180deg, #fff2f6 0%, #fff5f8 100%);
}

.message-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  max-width: min(78%, 760px);

  &.is-user {
    align-self: flex-end;
    justify-content: flex-end;

    .message-bubble {
      color: $color-text-white;
      background: linear-gradient(135deg, #f58ab6 0%, #b38cff 100%);
      border-radius: 20px 20px 6px;
      box-shadow: 0 14px 28px rgba(161, 72, 120, 0.16);
    }
  }

  &.is-assistant {
    align-self: flex-start;

    .message-bubble {
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.74);
      border-radius: 6px 22px 22px;
    }
  }
}

.message-mascot {
  display: grid;
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  place-items: center;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(244, 139, 181, 0.16);
  border-radius: 50%;
  box-shadow: 0 10px 22px rgba(161, 72, 120, 0.08);

  :deep(.taoling-mascot) {
    --mascot-size: 58px;
  }
}

.message-bubble {
  min-width: 0;
  padding: 15px 18px;
  color: $color-text-main;
  font-size: 15px;
  line-height: 1.8;

  p {
    margin: 0;
    white-space: pre-wrap;
  }
}

.recommend-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;

  span {
    padding: 3px 10px;
    color: $color-primary;
    background: #ffe5ee;
    border-radius: $radius-pill;
  }
}

.recommend-images {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  max-width: 680px;
  margin-top: 12px;

  article {
    overflow: hidden;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.88);
    border-radius: 18px;
    box-shadow: 0 14px 26px rgba(161, 72, 120, 0.08);
    transition:
      box-shadow 0.2s ease,
      transform 0.2s ease;

    &:hover {
      box-shadow: 0 18px 32px rgba(161, 72, 120, 0.14);
      transform: translateY(-2px);
    }
  }

  img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
  }

  span {
    display: block;
    overflow: hidden;
    padding: 10px 12px;
    color: $color-text-main;
    font-size: 13px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.inline-typing {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-width: 52px;
  padding: 8px 0;

  i {
    width: 7px;
    height: 7px;
    background: $color-primary-light;
    border-radius: 50%;
    animation: typingPulse 1.1s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.16s;
    }

    &:nth-child(3) {
      animation-delay: 0.32s;
    }
  }
}

.composer-area {
  padding: 16px 26px 22px;
  background: rgba(255, 255, 255, 0.76);
  border-top: 1px solid rgba(161, 72, 120, 0.08);
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;

  button {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 34px;
    padding: 0 14px;
    color: $color-primary;
    cursor: pointer;
    background: #ffe0ec;
    border: 0;
    border-radius: $radius-pill;

    &:nth-child(2) {
      color: #2e78aa;
      background: #dff3ff;
    }

    &:nth-child(3) {
      color: $color-secondary;
      background: #ece4ff;
    }
  }
}

.chat-input {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  min-height: 58px;
  padding: 7px 10px 7px 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(161, 72, 120, 0.16);
  border-radius: $radius-pill;

  input {
    min-width: 0;
    color: $color-text-main;
    font-size: 15px;
    background: transparent;
    border: 0;
    outline: none;
  }
}

.send-button {
  width: 44px;
  height: 44px;
  color: $color-primary-light;
  font-size: 24px;
  background: transparent;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

@keyframes typingPulse {
  0%,
  100% {
    opacity: 0.36;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(-5px);
  }
}

@media (max-width: 980px) {
  .assistant-view {
    padding: 42px 18px 72px;
  }

  .assistant-shell {
    height: auto;
    grid-template-columns: 1fr;
  }

  .conversation-panel {
    min-height: 430px;
  }

  .chat-card {
    min-height: 680px;
  }

  .history-box {
    min-height: 220px;
  }
}

@media (max-width: 620px) {
  .assistant-view {
    padding-inline: 14px;
  }

  .conversation-panel,
  .chat-card {
    border-radius: 26px;
  }

  .chat-header {
    grid-template-columns: 78px minmax(0, 1fr) auto;
    gap: 12px;
    padding: 16px;
  }

  .assistant-mascot-stage {
    width: 84px;
    height: 84px;

    :deep(.taoling-mascot) {
      --mascot-size: 84px;
    }
  }

  .assistant-copy h2 {
    font-size: 23px;
  }

  .assistant-copy p {
    display: none;
  }

  .message-list {
    padding: 20px 16px;
  }

  .message-row {
    max-width: 96%;
  }

  .recommend-images {
    grid-template-columns: 1fr;
  }

  .composer-area {
    padding: 14px 14px 16px;
  }

  .chat-input {
    border-radius: 24px;
  }
}
</style>
