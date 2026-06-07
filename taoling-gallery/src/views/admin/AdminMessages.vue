<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  Delete,
  RefreshRight,
  Search,
  User,
  Message,
  WarningFilled,
} from '@element-plus/icons-vue'

import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import TaolingMascot from '@/components/business/TaolingMascot.vue'
import { useAdminStore } from '@/stores/admin'
import type { AdminMessage, MessageCheckStatus } from '@/types/message'
import { formatDateTime } from '@/utils/image'

const adminStore = useAdminStore()
const selectedId = ref<number | null>(null)
const replyContent = ref('')
const blockVisible = ref(false)

const filters = reactive({
  keyword: '',
  check_status: '' as MessageCheckStatus | '',
  parent_id: '' as number | '',
  page: 1,
  pageSize: 9,
})

const statusText: Record<MessageCheckStatus, string> = {
  pending: '审核中',
  success: '已通过',
  block: '已拦截',
}

const selectedMessage = computed(() => adminStore.messageDetail || null)
const replies = computed(() => adminStore.messageDetail?.replies || [])

onMounted(() => {
  fetchMessages()
})

async function fetchMessages(options: { force?: boolean } = {}) {
  const result = await adminStore.fetchMessages(
    {
      ...filters,
      parent_id: filters.parent_id,
    },
    options,
  )

  const firstMessage = result.list[0]
  if (!selectedId.value && firstMessage) {
    await openDetail(firstMessage)
  }
}

function resetFilters() {
  filters.keyword = ''
  filters.check_status = ''
  filters.parent_id = ''
  filters.page = 1
  fetchMessages({ force: true })
}

async function openDetail(message: AdminMessage) {
  selectedId.value = message.id
  await adminStore.fetchMessageDetail(message.id)
}

async function submitReply() {
  if (!selectedId.value) return

  const content = replyContent.value.trim()
  if (!content) {
    ElMessage.warning('回复内容不能为空')
    return
  }

  if (content.length > 2000) {
    ElMessage.warning('回复最多 2000 字')
    return
  }

  await adminStore.replyMessage(selectedId.value, content)
  replyContent.value = ''
  ElMessage.success('回复已发送')
}

async function confirmBlock() {
  if (!selectedId.value) return

  await adminStore.blockMessage(selectedId.value)
  blockVisible.value = false
  selectedId.value = null
  await fetchMessages({ force: true })
  ElMessage.success('留言已屏蔽')
}

function prevPage() {
  filters.page--
  fetchMessages({ force: true })
}

function nextPage() {
  filters.page++
  fetchMessages({ force: true })
}

function displayUser(message: AdminMessage) {
  return message.username || message.user?.username || `用户 #${message.user_id}`
}
</script>

<template>
  <div class="admin-messages-page">
    <section class="header-section">
      <div class="header-content">
        <div class="header-title">
          <div class="icon-wrapper">
            <ElIcon><ChatDotRound /></ElIcon>
          </div>
          <div>
            <span class="subtitle">Message Management</span>
            <h1>用户留言管理</h1>
          </div>
        </div>
        <p class="header-desc">查看和管理用户在留言板上的留言，支持回复和屏蔽操作。</p>
      </div>
    </section>

    <section class="toolbar-card">
      <div class="search-wrapper">
        <label class="search-box">
          <ElIcon><Search /></ElIcon>
          <input
            v-model="filters.keyword"
            placeholder="搜索留言内容..."
            @keyup.enter="fetchMessages({ force: true })"
          />
        </label>
      </div>
      <div class="filter-group">
        <select v-model="filters.check_status" @change="fetchMessages({ force: true })">
          <option value="">全部状态</option>
          <option value="pending">审核中</option>
          <option value="success">已通过</option>
          <option value="block">已拦截</option>
        </select>
        <button type="button" class="btn-primary" @click="fetchMessages({ force: true })">
          <ElIcon><Search /></ElIcon>
          筛选
        </button>
        <button type="button" class="btn-secondary" @click="resetFilters">重置</button>
      </div>
      <div class="stats-row">
        <span class="stat-item">
          <span class="stat-num">{{ adminStore.messages.length }}</span>
          <span class="stat-label">留言总数</span>
        </span>
      </div>
    </section>

    <section class="messages-workspace">
      <div class="list-panel">
        <div class="panel-header">
          <h2>留言列表</h2>
          <button
            type="button"
            class="btn-refresh"
            :disabled="adminStore.loading"
            @click="fetchMessages({ force: true })"
          >
            <ElIcon><RefreshRight /></ElIcon>
          </button>
        </div>

        <div v-if="adminStore.loading && !adminStore.messages.length" class="empty-state">
          <div class="loading-spinner"></div>
          <p>正在加载留言...</p>
        </div>
        <div v-else-if="!adminStore.messages.length" class="empty-state">
          <TaolingMascot state="empty" size="sm" />
          <p>暂无匹配留言。</p>
        </div>
        <template v-else>
          <article
            v-for="messageItem in adminStore.messages"
            :key="messageItem.id"
            class="message-card"
            :class="{ 'is-active': selectedId === messageItem.id }"
            @click="openDetail(messageItem)"
          >
            <div class="card-header">
              <div class="user-info">
                <div class="user-avatar">
                  <ElIcon><User /></ElIcon>
                </div>
                <div>
                  <strong>{{ displayUser(messageItem) }}</strong>
                  <time>{{ formatDateTime(messageItem.created_at) }}</time>
                </div>
              </div>
              <span :class="`status-badge status-${messageItem.check_status}`">
                {{ statusText[messageItem.check_status] }}
              </span>
            </div>
            <div class="card-content">
              <p>{{ messageItem.content }}</p>
            </div>
            <div v-if="(messageItem.reply_count || 0) > 0" class="card-footer">
              <span class="reply-indicator">
                <ElIcon><ChatDotRound /></ElIcon>
                {{ messageItem.reply_count }} 条回复
              </span>
            </div>
          </article>
        </template>

        <div v-if="adminStore.messagePagination.total > filters.pageSize" class="pagination">
          <button :disabled="filters.page <= 1" type="button" class="page-btn" @click="prevPage">
            上一页
          </button>
          <span class="page-info">
            {{ adminStore.messagePagination.page }} /
            {{ adminStore.messagePagination.totalPages || 1 }}
          </span>
          <button
            :disabled="filters.page >= (adminStore.messagePagination.totalPages || 1)"
            type="button"
            class="page-btn"
            @click="nextPage"
          >
            下一页
          </button>
        </div>
      </div>

      <aside class="detail-panel">
        <template v-if="selectedMessage">
          <div class="detail-header">
            <div class="detail-user">
              <div class="avatar-lg">
                <ElIcon><User /></ElIcon>
              </div>
              <div class="user-meta">
                <strong>{{ displayUser(selectedMessage) }}</strong>
                <span>{{ selectedMessage.user?.email || '未绑定邮箱' }}</span>
              </div>
            </div>
            <span :class="`status-badge status-${selectedMessage.check_status}`">
              {{ statusText[selectedMessage.check_status] }}
            </span>
          </div>

          <div class="detail-actions">
            <button
              class="btn-danger"
              type="button"
              :disabled="selectedMessage.check_status === 'block'"
              @click="blockVisible = true"
            >
              <ElIcon><Delete /></ElIcon>
              屏蔽留言
            </button>
          </div>

          <div class="message-content-card">
            <div class="message-header">
              <span class="message-label">留言内容</span>
              <time>{{ formatDateTime(selectedMessage.created_at) }}</time>
            </div>
            <div class="message-body">
              <p>{{ selectedMessage.content }}</p>
            </div>
            <div v-if="selectedMessage.check_status === 'block'" class="block-notice">
              <ElIcon><WarningFilled /></ElIcon>
              <span
                >审核分：{{ selectedMessage.check_score ?? '-' }}，该留言已被内容安全拦截。</span
              >
            </div>
          </div>

          <div class="reply-section">
            <div class="section-header">
              <h3>
                <ElIcon><ChatDotRound /></ElIcon>
                管理员回复
                <span class="count-badge">{{ replies.length }}</span>
              </h3>
            </div>

            <div v-if="replies.length" class="reply-list">
              <article v-for="reply in replies" :key="reply.id" class="reply-item">
                <div class="reply-header">
                  <div class="reply-avatar">
                    <ElIcon><User /></ElIcon>
                  </div>
                  <div class="reply-meta">
                    <strong>管理员</strong>
                    <time>{{ formatDateTime(reply.created_at) }}</time>
                  </div>
                </div>
                <div class="reply-content">
                  <p>{{ reply.content }}</p>
                </div>
              </article>
            </div>
            <div v-else class="empty-reply">
              <TaolingMascot state="guide" size="sm" />
              <p>还没有回复，快来回复用户吧~</p>
            </div>

            <div class="reply-form">
              <textarea
                v-model="replyContent"
                maxlength="2000"
                placeholder="回复用户的留言..."
                :disabled="selectedMessage.check_status === 'block'"
              />
              <div class="form-footer">
                <span class="char-count">{{ replyContent.length }}/2000</span>
                <button
                  type="button"
                  class="btn-primary btn-send"
                  :disabled="!replyContent.trim() || selectedMessage.check_status === 'block'"
                  @click="submitReply"
                >
                  <ElIcon><Message /></ElIcon>
                  发送回复
                </button>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="empty-detail">
          <TaolingMascot state="guide" size="sm" />
          <p>选择一条留言查看详情与回复记录。</p>
        </div>
      </aside>
    </section>

    <ConfirmDialog
      v-model="blockVisible"
      danger
      title="确认屏蔽这条留言吗？"
      description="屏蔽后该留言会变为拦截状态，用户端留言板和用户个人中心都不会再展示。"
      confirm-text="屏蔽留言"
      @confirm="confirmBlock"
    />
  </div>
</template>

<style scoped lang="scss">
.admin-messages-page {
  display: grid;
  gap: 24px;
}

.header-section {
  padding: 32px 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 214, 229, 0.42), transparent 45%),
    radial-gradient(circle at 80% 20%, rgba(224, 215, 255, 0.38), transparent 45%),
    linear-gradient(135deg, #fff5f8 0%, #faf5ff 100%);
  border-radius: 32px;
}

.header-content {
  padding: 0 24px;
}

.header-title {
  display: flex;
  gap: 16px;
  align-items: center;
}

.icon-wrapper {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  color: $color-primary;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(244, 139, 181, 0.18);
}

.header-title h1 {
  margin: 0;
  color: $color-text-main;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  display: block;
  margin-bottom: 6px;
  color: $color-primary;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.header-desc {
  margin: 12px 0 0;
  color: $color-text-light;
  font-size: 15px;
  line-height: 1.6;
}

.toolbar-card {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(161, 72, 120, 0.08);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(161, 72, 120, 0.06);
}

.search-wrapper {
  flex: 1;
  max-width: 360px;
}

.search-box {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 18px;
  background: rgba(255, 248, 251, 0.92);
  border: 1px solid rgba(161, 72, 120, 0.12);
  border-radius: $radius-pill;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: rgba(244, 139, 181, 0.4);
  }
}

.search-box input {
  flex: 1;
  padding: 0;
  color: $color-text-main;
  font-size: 14px;
  background: transparent;
  border: 0;
  outline: none;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

select {
  min-height: 44px;
  padding: 0 16px;
  color: $color-text-main;
  font-size: 14px;
  background: rgba(255, 248, 251, 0.92);
  border: 1px solid rgba(161, 72, 120, 0.12);
  border-radius: 16px;
  outline: none;
  cursor: pointer;
}

button {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  color: $color-text-white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: $gradient-primary;
  border: 0;
  border-radius: $radius-pill;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(244, 139, 181, 0.32);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.btn-secondary {
  color: $color-primary;
  background: rgba(255, 241, 246, 0.92);
}

.btn-refresh {
  width: 42px;
  padding: 0;
  color: $color-primary;
  background: rgba(255, 248, 251, 0.92);
}

.btn-danger {
  color: #c64357;
  background: linear-gradient(135deg, #ffe5ee 0%, #ffd4e0 100%);
  box-shadow: 0 4px 14px rgba(198, 67, 87, 0.18);
}

.stats-row {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  background: rgba(255, 248, 251, 0.82);
  border-radius: 16px;
}

.stat-num {
  color: $color-primary;
  font-size: 22px;
  font-weight: 600;
}

.stat-label {
  color: $color-text-light;
  font-size: 12px;
}

.messages-workspace {
  display: grid;
  grid-template-columns: minmax(380px, 1fr) minmax(400px, 1.1fr);
  gap: 24px;
  align-items: start;
}

.list-panel,
.detail-panel {
  display: grid;
  gap: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(161, 72, 120, 0.06);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(161, 72, 120, 0.05);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(161, 72, 120, 0.08);
}

.panel-header h2 {
  margin: 0;
  color: $color-text-main;
  font-size: 20px;
  font-weight: 600;
}

.message-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  cursor: pointer;
  background:
    radial-gradient(circle at 94% 8%, rgba(255, 214, 229, 0.32), transparent 35%),
    rgba(255, 252, 253, 0.92);
  border: 2px solid transparent;
  border-radius: 20px;
  transition: all 0.22s ease;

  &:hover,
  &.is-active {
    border-color: rgba(244, 139, 181, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(161, 72, 120, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-info {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  display: grid;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  place-items: center;
  color: $color-primary;
  background: rgba(255, 214, 229, 0.56);
  border-radius: 14px;
}

.user-info strong {
  display: block;
  color: $color-text-main;
  font-size: 14px;
  font-weight: 500;
}

.user-info time {
  display: block;
  margin-top: 2px;
  color: $color-text-light;
  font-size: 12px;
}

.status-badge {
  flex-shrink: 0;
  padding: 4px 12px;
  color: $color-primary;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 214, 229, 0.64);
  border-radius: $radius-pill;

  &.status-success {
    color: #2f9e67;
    background: rgba(216, 245, 229, 0.78);
  }

  &.status-block {
    color: #c64357;
    background: rgba(255, 226, 233, 0.88);
  }
}

.card-content p {
  margin: 0;
  overflow: hidden;
  color: $color-text-secondary;
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.card-footer {
  padding-top: 10px;
  border-top: 1px solid rgba(161, 72, 120, 0.06);
}

.reply-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  color: $color-text-light;
  font-size: 12px;
}

.empty-state {
  display: grid;
  gap: 12px;
  min-height: 200px;
  place-items: center;
  padding: 32px;
  color: $color-text-light;
  text-align: center;
  background: rgba(255, 248, 251, 0.64);
  border-radius: 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(244, 139, 181, 0.2);
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid rgba(161, 72, 120, 0.06);
}

.page-btn {
  min-height: 38px;
  padding: 0 16px;
  color: $color-primary;
  font-size: 13px;
  background: rgba(255, 248, 251, 0.88);
  border-radius: 14px;

  &:disabled {
    color: $color-text-light;
    background: rgba(255, 255, 255, 0.6);
  }
}

.page-info {
  color: $color-text-light;
  font-size: 13px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(161, 72, 120, 0.08);
}

.detail-user {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar-lg {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  color: $color-primary;
  background: rgba(255, 214, 229, 0.62);
  border-radius: 20px;
}

.user-meta strong {
  display: block;
  color: $color-text-main;
  font-size: 18px;
  font-weight: 600;
}

.user-meta span {
  display: block;
  margin-top: 4px;
  color: $color-text-light;
  font-size: 13px;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
}

.message-content-card {
  padding: 20px;
  background:
    radial-gradient(circle at 96% 6%, rgba(255, 214, 229, 0.28), transparent 30%),
    rgba(255, 252, 253, 0.92);
  border: 1px solid rgba(161, 72, 120, 0.06);
  border-radius: 20px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-label {
  padding: 4px 12px;
  color: $color-primary;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 214, 229, 0.54);
  border-radius: $radius-pill;
}

.message-header time {
  color: $color-text-light;
  font-size: 13px;
}

.message-body p {
  margin: 16px 0 0;
  color: $color-text-main;
  font-size: 15px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.block-notice {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 14px;
  padding: 12px 16px;
  color: #c64357;
  font-size: 13px;
  background: rgba(255, 226, 233, 0.72);
  border-radius: 14px;
}

.reply-section {
  display: grid;
  gap: 16px;
}

.section-header h3 {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  color: $color-text-main;
  font-size: 18px;
  font-weight: 600;
}

.count-badge {
  padding: 2px 8px;
  color: $color-text-white;
  font-size: 11px;
  font-weight: 500;
  background: $gradient-primary;
  border-radius: $radius-pill;
}

.reply-list {
  display: grid;
  gap: 12px;
}

.reply-item {
  display: grid;
  gap: 10px;
  padding: 16px;
  background: rgba(255, 248, 251, 0.88);
  border: 1px solid rgba(161, 72, 120, 0.06);
  border-radius: 18px;
}

.reply-header {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reply-avatar {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #2f9e67;
  background: rgba(216, 245, 229, 0.68);
  border-radius: 12px;
}

.reply-meta strong {
  display: block;
  color: $color-text-main;
  font-size: 14px;
  font-weight: 500;
}

.reply-meta time {
  display: block;
  margin-top: 2px;
  color: $color-text-light;
  font-size: 12px;
}

.reply-content p {
  margin: 0;
  color: $color-text-main;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.empty-reply {
  display: grid;
  gap: 8px;
  place-items: center;
  padding: 24px;
  color: $color-text-light;
  text-align: center;
  background: rgba(255, 248, 251, 0.64);
  border-radius: 18px;
}

.reply-form {
  display: grid;
  gap: 12px;
}

.reply-form textarea {
  min-height: 120px;
  padding: 14px 16px;
  color: $color-text-main;
  font-size: 14px;
  line-height: 1.7;
  background: rgba(255, 248, 251, 0.92);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 18px;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: rgba(244, 139, 181, 0.35);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  color: $color-text-light;
  font-size: 13px;
}

.btn-send {
  padding: 0 24px;
}

.empty-detail {
  display: grid;
  gap: 12px;
  min-height: 300px;
  place-items: center;
  padding: 40px;
  color: $color-text-light;
  text-align: center;
  background: rgba(255, 248, 251, 0.64);
  border-radius: 20px;
}

@media (max-width: 1120px) {
  .messages-workspace {
    grid-template-columns: 1fr;
  }

  .toolbar-card {
    flex-wrap: wrap;
  }

  .search-wrapper {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 640px) {
  .header-section {
    padding: 24px 0;
  }

  .header-title h1 {
    font-size: 24px;
  }

  .toolbar-card {
    padding: 16px;
  }

  .list-panel,
  .detail-panel {
    padding: 16px;
  }
}
</style>
