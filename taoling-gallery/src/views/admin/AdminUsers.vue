<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Document, RefreshLeft, Search, SwitchButton, User } from '@element-plus/icons-vue'

import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import TaolingMascot from '@/components/business/TaolingMascot.vue'
import { useAdminStore } from '@/stores/admin'
import type { AdminUser } from '@/types/admin'
import { formatDateTime } from '@/utils/image'
import { useUserStore } from '@/stores/user'

const adminStore = useAdminStore()
const userStore = useUserStore()
const activeTab = ref<'users' | 'logs'>('users')
const deleteVisible = ref(false)
const pendingUser = ref<AdminUser | null>(null)

const userFilters = reactive({
  keyword: '',
  role: '' as 'user' | 'admin' | '',
  status: '' as 'normal' | 'disabled' | '',
  page: 1,
  pageSize: 9,
})

const logFilters = reactive({
  action_type: '',
  target_type: '',
  page: 1,
  pageSize: 10,
})

const userTotalPages = computed(
  () => Math.ceil(adminStore.userPagination.total / userFilters.pageSize) || 1,
)
const logTotalPages = computed(
  () => Math.ceil(adminStore.logPagination.total / logFilters.pageSize) || 1,
)

onMounted(() => {
  fetchUsers()
  fetchLogs()
})

async function fetchUsers(options: { force?: boolean } = {}) {
  await adminStore.fetchUsers(userFilters, options)
  userFilters.page = adminStore.userPagination.page
}

async function fetchLogs(options: { force?: boolean } = {}) {
  await adminStore.fetchLogs(logFilters, options)
  logFilters.page = adminStore.logPagination.page
}

function applyUserFilters() {
  userFilters.page = 1
  fetchUsers({ force: true })
}

function applyLogFilters() {
  logFilters.page = 1
  fetchLogs({ force: true })
}

function resetLogs() {
  logFilters.action_type = ''
  logFilters.target_type = ''
  logFilters.page = 1
  fetchLogs({ force: true })
}

function formatActionType(action: string) {
  const actionMap: Record<string, string> = {
    USER_LOGIN: '用户登录',
    AI_CONVERSATION_CREATE: '创建 AI 会话',
    AI_CONVERSATION_DELETE: '删除 AI 会话',
    IMAGE_CREATE: '发布图片',
    IMAGE_UPDATE: '更新图片',
    IMAGE_DELETE: '删除图片',
    CATEGORY_CREATE: '新增分类',
    CATEGORY_UPDATE: '更新分类',
    CATEGORY_DELETE: '删除分类',
    TAG_CREATE: '新增标签',
    TAG_UPDATE: '更新标签',
    TAG_DELETE: '删除标签',
    USER_STATUS_UPDATE: '更新用户状态',
  }

  return actionMap[action] || action.replaceAll('_', ' ')
}

function formatTargetType(target: string) {
  const targetMap: Record<string, string> = {
    image: '图片',
    category: '分类',
    tag: '标签',
    user: '用户',
    system: '系统',
    ai_conversation: 'AI 会话',
  }

  return targetMap[target] || target
}

async function toggleUserStatus(user: AdminUser) {
  const next = user.status === 'disabled' ? 'normal' : 'disabled'
  await adminStore.updateUserStatus(user.id, next)
  ElMessage.success(next === 'normal' ? '用户已恢复' : '用户已禁用')
}

function openDelete(user: AdminUser) {
  pendingUser.value = user
  deleteVisible.value = true
}

async function confirmDelete() {
  if (!pendingUser.value) return
  await adminStore.deleteUser(pendingUser.value.id)
  deleteVisible.value = false
  ElMessage.success('用户已删除并禁用')
}

function prevUserPage() {
  userFilters.page--
  fetchUsers({ force: true })
}

function nextUserPage() {
  userFilters.page++
  fetchUsers({ force: true })
}

function prevLogPage() {
  logFilters.page--
  fetchLogs({ force: true })
}

function nextLogPage() {
  logFilters.page++
  fetchLogs({ force: true })
}
</script>

<template>
  <div class="admin-users-page">
    <section class="tab-card">
      <button
        :class="{ 'is-active': activeTab === 'users' }"
        type="button"
        @click="activeTab = 'users'"
      >
        <ElIcon><User /></ElIcon>
        用户管理
      </button>
      <button
        :class="{ 'is-active': activeTab === 'logs' }"
        type="button"
        @click="activeTab = 'logs'"
      >
        <ElIcon><Document /></ElIcon>
        操作日志
      </button>
    </section>

    <section v-if="activeTab === 'users'" class="users-panel">
      <div class="toolbar">
        <label class="search-box">
          <ElIcon><Search /></ElIcon>
          <input
            v-model="userFilters.keyword"
            placeholder="搜索用户名或邮箱..."
            @keyup.enter="applyUserFilters"
          />
        </label>
        <select v-model="userFilters.role" @change="applyUserFilters">
          <option value="">全部角色</option>
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>
        <select v-model="userFilters.status" @change="applyUserFilters">
          <option value="">全部状态</option>
          <option value="normal">正常</option>
          <option value="disabled">禁用</option>
        </select>
        <button type="button" @click="applyUserFilters">筛选</button>
      </div>

      <div v-if="adminStore.loading && !adminStore.users.length" class="soft-state">
        正在加载用户...
      </div>
      <div v-else-if="!adminStore.users.length" class="soft-state">
        <TaolingMascot state="empty" size="sm" />
        <p>没有匹配的用户。</p>
      </div>
      <div v-else class="user-grid">
        <article
          v-for="user in adminStore.users"
          :key="user.id"
          class="user-card"
          :class="{ 'is-self': user.id === userStore.user?.id }"
        >
          <div class="user-main">
            <img
              :src="
                user.avatar_url ||
                userStore.defaultAvatars[user.id % userStore.defaultAvatars.length]
              "
              :alt="user.username"
              width="58"
              height="58"
              loading="lazy"
              decoding="async"
            />
            <div>
              <strong>{{ user.username }}</strong>
              <span>{{ user.email || '未绑定邮箱' }}</span>
            </div>
          </div>
          <div class="badges">
            <span>{{ user.role === 'admin' ? '管理员' : '普通用户' }}</span>
            <span :class="{ danger: user.status === 'disabled' }">{{
              user.status === 'disabled' ? '禁用' : '正常'
            }}</span>
          </div>
          <dl>
            <div>
              <dt>收藏</dt>
              <dd>{{ user.stats?.favorite_count || 0 }}</dd>
            </div>
            <div>
              <dt>下载</dt>
              <dd>{{ user.stats?.download_count || 0 }}</dd>
            </div>
            <div>
              <dt>AI 会话</dt>
              <dd>{{ user.stats?.ai_conversation_count || 0 }}</dd>
            </div>
          </dl>
          <p>注册：{{ formatDateTime(user.created_at) }}</p>
          <p>最近登录：{{ formatDateTime(user.last_login_at) }}</p>
          <div class="card-actions">
            <button
              type="button"
              :disabled="user.id === userStore.user?.id"
              @click="toggleUserStatus(user)"
            >
              <ElIcon
                ><component :is="user.status === 'disabled' ? RefreshLeft : SwitchButton"
              /></ElIcon>
              {{ user.status === 'disabled' ? '恢复' : '禁用' }}
            </button>
            <button
              class="danger-button"
              type="button"
              :disabled="user.id === userStore.user?.id"
              @click="openDelete(user)"
            >
              <ElIcon><Delete /></ElIcon>
              删除
            </button>
          </div>
        </article>
      </div>

      <div v-if="adminStore.userPagination.total > userFilters.pageSize" class="pager">
        <button :disabled="userFilters.page <= 1" @click="prevUserPage">上一页</button>
        <span>{{ userFilters.page }} / {{ userTotalPages }}</span>
        <button :disabled="userFilters.page >= userTotalPages" @click="nextUserPage">下一页</button>
      </div>
    </section>

    <section v-else class="logs-panel">
      <div class="toolbar">
        <input
          v-model="logFilters.action_type"
          placeholder="动作类型"
          @keyup.enter="fetchLogs({ force: true })"
        />
        <input
          v-model="logFilters.target_type"
          placeholder="目标类型"
          @keyup.enter="fetchLogs({ force: true })"
        />
        <button type="button" @click="applyLogFilters">筛选日志</button>
        <button class="plain-button" type="button" @click="resetLogs">重置</button>
      </div>
      <div v-if="!adminStore.logs.length" class="soft-state">暂无操作日志。</div>
      <ul v-else class="log-list">
        <li v-for="log in adminStore.logs" :key="log.id">
          <div class="log-kind">
            <span>{{ formatActionType(log.action_type) }}</span>
            <small>{{ formatTargetType(log.target_type) }}</small>
          </div>
          <div class="log-main">
            <strong>{{ log.title || `${log.target_type} #${log.target_id || '-'}` }}</strong>
            <p>{{ log.content || `${log.actor_name || '管理员'} 执行了操作` }}</p>
            <em>{{ log.actor_name || '桃灵管理员' }}</em>
          </div>
          <time class="log-time">{{ formatDateTime(log.created_at) }}</time>
        </li>
      </ul>
      <div v-if="adminStore.logPagination.total > logFilters.pageSize" class="pager">
        <button :disabled="logFilters.page <= 1" @click="prevLogPage">上一页</button>
        <span>{{ logFilters.page }} / {{ logTotalPages }}</span>
        <button :disabled="logFilters.page >= logTotalPages" @click="nextLogPage">下一页</button>
      </div>
    </section>

    <ConfirmDialog
      v-model="deleteVisible"
      danger
      title="确认删除用户吗？"
      :description="`用户「${pendingUser?.username || ''}」会被软删除并禁用账号，历史收藏、下载和 AI 会话不会被删除。`"
      confirm-text="删除用户"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped lang="scss">
.admin-users-page {
  display: grid;
  gap: 24px;
}

.tab-card,
.users-panel,
.logs-panel,
.user-card {
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 28px;
  box-shadow: $shadow-soft;
  backdrop-filter: blur(18px);
}

.tab-card {
  display: flex;
  gap: 12px;
  width: fit-content;
  padding: 10px;

  button {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 42px;
    padding: 0 20px;
    color: $color-text-secondary;
    cursor: pointer;
    background: rgba(255, 241, 246, 0.8);
    border: 0;
    border-radius: $radius-pill;

    &.is-active {
      color: $color-primary;
      background: rgba(255, 214, 229, 0.74);
    }
  }
}

.users-panel,
.logs-panel {
  display: grid;
  gap: 22px;
  padding: 24px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.search-box {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

input,
select {
  min-height: 44px;
  padding: 0 16px;
  color: $color-text-main;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(161, 72, 120, 0.18);
  border-radius: 18px;
  outline: none;
}

button {
  min-height: 42px;
  padding: 0 16px;
  color: $color-text-white;
  cursor: pointer;
  background: $gradient-primary;
  border: 0;
  border-radius: $radius-pill;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.user-card {
  display: grid;
  gap: 14px;
  padding: 22px;
  background:
    radial-gradient(circle at 86% 18%, rgba(234, 223, 255, 0.34), transparent 34%),
    rgba(255, 255, 255, 0.78);

  &.is-self {
    border-color: rgba(139, 110, 234, 0.26);
  }
}

.user-main {
  display: flex;
  gap: 12px;
  align-items: center;

  img {
    width: 58px;
    height: 58px;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    box-shadow: 0 10px 24px rgba(161, 72, 120, 0.12);
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: $color-text-main;
    font-size: 18px;
  }

  span {
    color: $color-text-light;
    font-size: 13px;
  }
}

.badges,
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.badges span {
  padding: 6px 12px;
  color: $color-primary;
  background: rgba(255, 214, 229, 0.56);
  border-radius: $radius-pill;

  &.danger {
    color: #d85248;
    background: rgba(255, 218, 220, 0.78);
  }
}

dl {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 14px 0;
  margin: 0;
  border-top: 1px solid rgba(161, 72, 120, 0.1);
  border-bottom: 1px solid rgba(161, 72, 120, 0.1);

  div {
    text-align: center;
  }

  dt {
    color: $color-text-light;
    font-size: 12px;
  }

  dd {
    margin: 4px 0 0;
    color: $color-primary;
    font-size: 20px;
  }
}

.user-card p {
  margin: 0;
  color: $color-text-light;
  font-size: 13px;
}

.danger-button {
  color: #c64357;
  background: rgba(255, 226, 233, 0.9);
}

.plain-button {
  color: $color-primary;
  background: rgba(255, 241, 246, 0.92);
}

.soft-state {
  display: grid;
  gap: 10px;
  place-items: center;
  padding: 42px;
  color: $color-text-light;
  text-align: center;
  background: rgba(255, 248, 251, 0.72);
  border-radius: 22px;
}

.log-list {
  display: grid;
  gap: 14px;
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: minmax(138px, 0.24fr) minmax(0, 1fr) minmax(150px, auto);
    gap: 18px;
    align-items: start;
    padding: 18px;
    background:
      radial-gradient(circle at 94% 12%, rgba(255, 214, 229, 0.46), transparent 30%),
      rgba(255, 248, 251, 0.78);
    border: 1px solid rgba(161, 72, 120, 0.08);
    border-radius: 22px;
  }

  strong {
    display: block;
    color: $color-text-main;
    font-size: 16px;
    line-height: 1.45;
  }

  p,
  time,
  em {
    display: block;
    margin: 6px 0 0;
    color: $color-text-light;
    font-size: 13px;
    line-height: 1.6;
  }

  em {
    font-style: normal;
  }
}

.log-kind {
  display: grid;
  gap: 8px;
  justify-items: start;
  min-width: 0;

  span {
    max-width: 100%;
    padding: 7px 12px;
    color: $color-primary;
    line-height: 1.45;
    overflow-wrap: anywhere;
    background: rgba(255, 214, 229, 0.58);
    border-radius: 14px;
  }

  small {
    padding: 4px 10px;
    color: $color-secondary;
    background: rgba(234, 223, 255, 0.62);
    border-radius: $radius-pill;
  }
}

.log-main {
  min-width: 0;
}

.log-time {
  justify-self: end;
  padding: 6px 0;
  text-align: right;
  white-space: nowrap;
}

.pager {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
  margin-top: 20px;

  button {
    min-height: 42px;
    padding: 0 18px;
    color: $color-text-white;
    cursor: pointer;
    background: $gradient-primary;
    border: 0;
    border-radius: $radius-pill;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  }

  span {
    color: $color-text-light;
    font-size: 14px;
  }
}

@media (max-width: 1120px) {
  .user-grid {
    grid-template-columns: 1fr;
  }

  .log-list li {
    grid-template-columns: 1fr;
  }

  .log-time {
    justify-self: start;
    text-align: left;
    white-space: normal;
  }
}
</style>
