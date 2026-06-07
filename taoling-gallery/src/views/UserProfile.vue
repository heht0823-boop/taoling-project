<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  Collection,
  Delete,
  Download,
  EditPen,
  Message,
  PictureRounded,
  RefreshRight,
  SwitchButton,
  Upload,
  User,
  View,
} from '@element-plus/icons-vue'

import TaolingMascot from '@/components/business/TaolingMascot.vue'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import { useDownloadStore } from '@/stores/download'
import { useFavoriteStore } from '@/stores/favorite'
import { useUserStore } from '@/stores/user'
import type { FavoriteRecord } from '@/types/favorite'
import {
  formatCount,
  formatDateTime,
  getAspectRatioSize,
  resolveAvatarImageUrl,
  resolveAvatarSrcset,
  resolveImageUrl,
} from '@/utils/image'

type ProfileTab = 'favorites' | 'downloads' | 'messages' | 'profile'

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()
const downloadStore = useDownloadStore()
const activeTab = ref<ProfileTab>('favorites')
const logoutVisible = ref(false)
const clearDownloadsVisible = ref(false)
const deleteDownloadVisible = ref(false)
const saveProfileVisible = ref(false)
const pendingDeleteDownload = ref<number | null>(null)
const avatarFileInput = ref<HTMLInputElement | null>(null)
const messageForm = reactive({
  content: '',
})
const messageFilters = reactive({
  page: 1,
  pageSize: 8,
})

const profileForm = reactive({
  username: '',
  email: '',
})

const stats = computed(() => userStore.stats)
const profileAvatarUrl = computed(() =>
  resolveAvatarImageUrl(userStore.avatarUrl, userStore.avatarThumbnailUrl),
)
const profileAvatarSrcset = computed(() => resolveAvatarSrcset(userStore.avatarSrcset))
const recordImageSize = getAspectRatioSize('4:3', 320)
const tabs = [
  { key: 'favorites' as const, label: '我的收藏', icon: Collection },
  { key: 'downloads' as const, label: '下载记录', icon: Download },
  { key: 'messages' as const, label: '我的留言', icon: ChatDotRound },
  { key: 'profile' as const, label: '账号资料', icon: User },
]

async function loadProfile() {
  try {
    const result = await userStore.getProfileSummary()
    profileForm.username = result.user.username
    profileForm.email = result.user.email || ''
  } catch {
    ElMessage.error('用户资料加载失败，请稍后再试')
  }

  await Promise.allSettled([favoriteStore.fetchFavorites(), downloadStore.fetchDownloads()])
  await userStore.fetchMessages(messageFilters)
}

function switchTab(tab: ProfileTab) {
  activeTab.value = tab
}

function goGallery() {
  void router.push('/gallery')
}

function openFavorite(record: FavoriteRecord) {
  void router.push(`/images/${record.image.id}`)
}

async function saveProfile() {
  if (!profileForm.username.trim()) {
    ElMessage.warning('用户名不能为空')
    return
  }

  saveProfileVisible.value = true
}

async function confirmSaveProfile() {
  try {
    await userStore.updateProfile({
      username: profileForm.username.trim(),
      email: profileForm.email.trim() || undefined,
    })
    saveProfileVisible.value = false
    ElMessage.success('账号资料已更新')
  } catch {
    ElMessage.error('资料更新失败，请稍后再试')
  }
}

function chooseAvatarFile() {
  avatarFileInput.value?.click()
}

async function uploadAvatar(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  try {
    await userStore.uploadAvatarFile(file)
    ElMessage.success('头像已更新')
  } catch (error) {
    ElMessage.error((error as Error)?.message || '头像上传失败，请稍后再试')
  } finally {
    input.value = ''
  }
}

async function submitMessage() {
  const content = messageForm.content.trim()

  if (!content) {
    ElMessage.warning('留言内容不能为空')
    return
  }

  if (content.length > 2000) {
    ElMessage.warning('留言最多 2000 字')
    return
  }

  try {
    await userStore.createMessage({ content })
    messageForm.content = ''
    messageFilters.page = 1
    await userStore.fetchMessages(messageFilters, { force: true })
    ElMessage.success('留言已收到，审核通过后会出现在留言板')
  } catch {
    ElMessage.error('留言提交失败，请稍后再试')
    await userStore.fetchMessages(messageFilters, { force: true })
  }
}

function prevMessagePage() {
  messageFilters.page--
  userStore.fetchMessages(messageFilters, { force: true })
}

function nextMessagePage() {
  messageFilters.page++
  userStore.fetchMessages(messageFilters, { force: true })
}

function openDeleteDownload(recordId: number) {
  pendingDeleteDownload.value = recordId
  deleteDownloadVisible.value = true
}

async function confirmDeleteDownload() {
  if (!pendingDeleteDownload.value) {
    return
  }

  try {
    await downloadStore.deleteDownloadRecord(pendingDeleteDownload.value)
    ElMessage.success('下载记录已删除')
  } catch {
    ElMessage.error('删除下载记录失败')
  } finally {
    deleteDownloadVisible.value = false
    pendingDeleteDownload.value = null
  }
}

async function clearDownloads() {
  try {
    await downloadStore.clearDownloadRecords()
    ElMessage.success('下载记录已清空')
  } catch {
    ElMessage.error('清空下载记录失败')
  } finally {
    clearDownloadsVisible.value = false
  }
}

async function logout() {
  await userStore.logout()
  logoutVisible.value = false
  await router.push('/auth')
}

onMounted(() => {
  if (!userStore.isLoggedIn) return
  profileForm.username = userStore.user?.username || ''
  profileForm.email = userStore.user?.email || ''
  void loadProfile()
})
</script>

<template>
  <section class="profile-view">
    <div class="profile-glow profile-glow--top" />
    <div class="profile-glow profile-glow--bottom" />

    <div v-if="userStore.isLoggedIn" class="profile-shell">
      <aside class="profile-sidebar">
        <section class="user-card">
          <div class="profile-avatar-shell">
            <img
              class="profile-avatar"
              :src="profileAvatarUrl"
              :srcset="profileAvatarSrcset"
              :alt="`${userStore.displayName}头像`"
              width="104"
              height="104"
              decoding="async"
            />
          </div>
          <div class="avatar-actions">
            <button type="button" :disabled="userStore.avatarLoading" @click="chooseAvatarFile">
              <ElIcon><Upload /></ElIcon>
              上传头像
            </button>
            <input
              ref="avatarFileInput"
              class="avatar-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="uploadAvatar"
            />
          </div>
          <h1>{{ userStore.displayName }}</h1>
          <p>{{ userStore.user?.email || '桃灵图库探索者' }}</p>

          <div class="stats-grid">
            <div>
              <strong>{{ formatCount(stats?.favorite_count) }}</strong>
              <span>收藏</span>
            </div>
            <div>
              <strong>{{ formatCount(stats?.download_count) }}</strong>
              <span>下载</span>
            </div>
            <div>
              <strong>{{ formatCount(stats?.view_count) }}</strong>
              <span>浏览</span>
            </div>
          </div>
        </section>

        <nav class="profile-tabs" aria-label="用户中心导航">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="profile-tab"
            :class="{ 'is-active': activeTab === tab.key }"
            type="button"
            @click="switchTab(tab.key)"
          >
            <ElIcon><component :is="tab.icon" /></ElIcon>
            {{ tab.label }}
          </button>
        </nav>

        <button class="logout-panel-button" type="button" @click="logoutVisible = true">
          <ElIcon><SwitchButton /></ElIcon>
          退出登录
        </button>
      </aside>

      <div class="profile-content">
        <section v-if="activeTab === 'favorites'" class="content-panel">
          <div class="panel-heading">
            <div>
              <span class="soft-label">My Favorites</span>
              <h2>我的收藏</h2>
            </div>
            <button type="button" @click="goGallery">去探索图库</button>
          </div>

          <div v-if="favoriteStore.loading" class="mini-skeleton" />
          <div v-else-if="favoriteStore.list.length" class="record-grid">
            <article
              v-for="record in favoriteStore.list"
              :key="record.favorite_id"
              class="favorite-card"
              @click="openFavorite(record)"
            >
              <img
                :src="resolveImageUrl(record.image.thumbnail_url || record.image.image_url)"
                :alt="record.image.title"
                :width="recordImageSize.width"
                :height="recordImageSize.height"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3>{{ record.image.title }}</h3>
                <span>{{ formatDateTime(record.created_at) }}</span>
              </div>
            </article>
          </div>
          <div v-else class="empty-state">
            <TaolingMascot state="empty" autoplay size="md" />
            <h3>这里空空的呀</h3>
            <p>你还没有收藏任何灵感。去图库逛逛，把喜欢的作品带回你的小岛吧！</p>
            <button type="button" @click="goGallery">去探索图库</button>
          </div>
        </section>

        <section v-else-if="activeTab === 'downloads'" class="content-panel">
          <div class="panel-heading">
            <div>
              <span class="soft-label">Download Records</span>
              <h2>下载记录</h2>
            </div>
            <button
              type="button"
              :disabled="!downloadStore.list.length"
              @click="clearDownloadsVisible = true"
            >
              清空记录
            </button>
          </div>

          <div v-if="downloadStore.loading" class="mini-skeleton" />
          <div v-else-if="downloadStore.list.length" class="record-list">
            <article v-for="record in downloadStore.list" :key="record.id" class="download-row">
              <img
                :src="resolveImageUrl(record.image_url)"
                :alt="record.image_title"
                width="78"
                height="58"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3>{{ record.image_title || '下载图片' }}</h3>
                <span>{{ formatDateTime(record.created_at) }}</span>
              </div>
              <button
                type="button"
                aria-label="删除下载记录"
                @click="openDeleteDownload(record.id)"
              >
                <ElIcon><Delete /></ElIcon>
              </button>
            </article>
          </div>
          <div v-else class="empty-state">
            <TaolingMascot state="sleepy" autoplay size="md" />
            <h3>还没有下载记录</h3>
            <p>下载喜欢的图片后，桃灵会帮你把记录整理在这里。</p>
            <button type="button" @click="goGallery">去图库看看</button>
          </div>
        </section>

        <section v-else-if="activeTab === 'messages'" class="content-panel">
          <div class="panel-heading">
            <div>
              <span class="soft-label">My Messages</span>
              <h2>我的留言</h2>
            </div>
            <button
              type="button"
              :disabled="userStore.messageLoading"
              @click="userStore.fetchMessages(messageFilters, { force: true })"
            >
              <ElIcon><RefreshRight /></ElIcon>
              刷新
            </button>
          </div>

          <form class="message-form" @submit.prevent="submitMessage">
            <textarea
              v-model="messageForm.content"
              maxlength="2000"
              placeholder="把使用反馈、图片下载问题、想看的图片主题，或需要管理员帮忙制作的图片需求留在这里..."
            />
            <div class="message-form-footer">
              <span>{{ messageForm.content.length }}/2000</span>
              <button type="submit" :disabled="userStore.messageLoading">提交留言</button>
            </div>
          </form>

          <div
            v-if="userStore.messageLoading && !userStore.messages.length"
            class="mini-skeleton"
          />
          <div v-else-if="userStore.messages.length" class="message-list">
            <article
              v-for="messageItem in userStore.messages"
              :key="messageItem.id"
              class="message-card"
            >
              <div class="message-card-head">
                <span class="message-status">已公开</span>
                <time>{{ formatDateTime(messageItem.created_at) }}</time>
              </div>
              <p>{{ messageItem.content }}</p>
            </article>
          </div>
          <div v-else class="empty-state">
            <TaolingMascot state="guide" autoplay size="md" />
            <h3>还没有留言</h3>
            <p>有使用反馈、图片下载问题或想看的图库方向，都可以温柔地告诉桃灵。</p>
          </div>

          <div
            v-if="userStore.messagePagination.total > messageFilters.pageSize"
            class="message-pager"
          >
            <button :disabled="messageFilters.page <= 1" type="button" @click="prevMessagePage">
              上一页
            </button>
            <span>
              {{ userStore.messagePagination.page }} /
              {{ userStore.messagePagination.totalPages || 1 }}
            </span>
            <button
              :disabled="messageFilters.page >= (userStore.messagePagination.totalPages || 1)"
              type="button"
              @click="nextMessagePage"
            >
              下一页
            </button>
          </div>
        </section>

        <section v-else class="content-panel">
          <div class="panel-heading">
            <div>
              <span class="soft-label">Account Profile</span>
              <h2>账号资料</h2>
            </div>
          </div>

          <form class="profile-form" @submit.prevent="saveProfile">
            <label>
              <span
                ><ElIcon><User /></ElIcon>用户名</span
              >
              <input v-model="profileForm.username" maxlength="24" />
            </label>
            <label>
              <span
                ><ElIcon><Message /></ElIcon>邮箱</span
              >
              <input v-model="profileForm.email" type="email" />
            </label>
            <div class="profile-note">
              <ElIcon><EditPen /></ElIcon>
              头像支持 jpg / png / webp 格式上传。
            </div>
            <button class="save-button" type="submit" :disabled="userStore.loading">
              保存资料
            </button>
          </form>

          <div class="profile-extra">
            <div>
              <ElIcon><PictureRounded /></ElIcon>收藏 {{ formatCount(stats?.favorite_count) }}
            </div>
            <div>
              <ElIcon><Download /></ElIcon>下载 {{ formatCount(stats?.download_count) }}
            </div>
            <div>
              <ElIcon><View /></ElIcon>浏览 {{ formatCount(stats?.view_count) }}
            </div>
          </div>
        </section>
      </div>
    </div>

    <div v-else class="login-prompt">
      <div class="prompt-card">
        <TaolingMascot state="welcome" autoplay size="md" />
        <h2>登录桃灵图库</h2>
        <p>
          登录后可以收藏喜欢的图片、下载灵感作品、使用桃灵助手，<br />还能随时随地查看你的收藏和下载记录。
        </p>
        <button class="prompt-login-button" type="button" @click="router.push('/auth')">
          前往登录
        </button>
        <button class="prompt-guest-button" type="button" @click="router.push('/gallery')">
          我先逛逛
        </button>
      </div>
    </div>

    <ConfirmDialog
      v-model="saveProfileVisible"
      title="确认保存资料吗？"
      description="用户名和邮箱信息将会被更新。"
      confirm-text="保存"
      @confirm="confirmSaveProfile"
    />

    <ConfirmDialog
      v-model="logoutVisible"
      danger
      title="确认退出登录吗？"
      description="退出后会回到登录注册页，也可以继续以游客身份浏览图库。"
      confirm-text="退出"
      cancel-text="取消"
      @confirm="logout"
    />

    <ConfirmDialog
      v-model="deleteDownloadVisible"
      danger
      title="删除这条下载记录吗？"
      description="该操作只会移除这条记录，不会删除图库中的图片文件。"
      confirm-text="删除"
      cancel-text="保留"
      @confirm="confirmDeleteDownload"
    />

    <ConfirmDialog
      v-model="clearDownloadsVisible"
      danger
      title="清空下载记录吗？"
      description="该操作会移除当前账号下的全部下载记录。"
      confirm-text="清空"
      cancel-text="保留"
      @confirm="clearDownloads"
    />
  </section>
</template>

<style scoped lang="scss">
.profile-view {
  position: relative;
  min-height: calc(100vh - 112px);
  overflow: hidden;
  padding: 150px clamp(24px, 7vw, 108px) 90px;
  background:
    radial-gradient(circle at 12% 3%, rgba(255, 151, 188, 0.16), transparent 32%),
    linear-gradient(180deg, #fff9fb 0%, #fff5f8 100%);
}

.profile-glow {
  position: absolute;
  width: 42vw;
  max-width: 540px;
  aspect-ratio: 1;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(20px);
}

.profile-glow--top {
  top: -24%;
  left: -8%;
  background: radial-gradient(circle, rgba(255, 139, 181, 0.2), transparent 70%);
}

.profile-glow--bottom {
  right: -14%;
  bottom: 10%;
  background: radial-gradient(circle, rgba(197, 182, 255, 0.18), transparent 70%);
}

.profile-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 28px;
  max-width: 1250px;
  margin: 0 auto;
}

.profile-sidebar,
.content-panel {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 34px;
  box-shadow: 0 24px 60px rgba(161, 72, 120, 0.1);
  backdrop-filter: blur(18px);
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 22px;
}

.user-card {
  display: grid;
  justify-items: center;
  padding: 34px 28px;
  text-align: center;
  background: rgba(255, 250, 252, 0.72);
  border-radius: 30px;
}

.profile-avatar-shell {
  display: grid;
  width: 104px;
  height: 104px;
  place-items: center;
  overflow: hidden;
  background: #fff8fb;
  border: 4px solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  box-shadow: 0 18px 34px rgba(161, 72, 120, 0.12);
}

.profile-avatar {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}

.avatar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 14px;

  button {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    min-height: 34px;
    padding: 0 12px;
    color: $color-primary;
    cursor: pointer;
    background: rgba(255, 235, 242, 0.82);
    border: 0;
    border-radius: $radius-pill;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.56;
    }
  }
}

.avatar-file-input {
  display: none;
}

.user-card h1 {
  margin: 18px 0 0;
  color: $color-primary;
  font-size: 24px;
  font-weight: 600;
}

.user-card p {
  margin: 8px 0 0;
  color: $color-text-light;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding-top: 24px;
  margin-top: 28px;
  border-top: 1px solid rgba(161, 72, 120, 0.14);

  strong,
  span {
    display: block;
  }

  strong {
    color: #0878ae;
    font-size: 20px;
    font-weight: 600;
  }

  span {
    margin-top: 4px;
    color: $color-text-secondary;
  }
}

.profile-tabs {
  display: grid;
  gap: 12px;
}

.profile-tab,
.logout-panel-button {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  min-height: 58px;
  padding: 0 22px;
  color: $color-text-main;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.58);
  border: 0;
  border-radius: $radius-pill;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &.is-active {
    background: #ffd1df;
  }

  &:hover {
    transform: translateY(-1px);
  }
}

.logout-panel-button {
  margin-top: auto;
  color: #d94141;
  border: 1px solid rgba(217, 65, 65, 0.12);
}

.content-panel {
  min-height: 620px;
  padding: clamp(34px, 5vw, 56px);
}

.panel-heading {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;

  h2 {
    margin: 8px 0 0;
    color: $color-text-main;
    font-size: 32px;
    font-weight: 600;
  }

  button {
    min-height: 40px;
    padding: 0 18px;
    color: $color-primary;
    cursor: pointer;
    background: rgba(255, 235, 242, 0.8);
    border: 0;
    border-radius: $radius-pill;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.46;
    }
  }
}

.soft-label {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 0 12px;
  color: $color-primary;
  font-size: 12px;
  background: rgba(255, 241, 247, 0.82);
  border: 1px solid rgba(244, 139, 181, 0.18);
  border-radius: $radius-pill;
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.favorite-card,
.download-row {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.78);
  border-radius: 24px;
  box-shadow: 0 16px 34px rgba(161, 72, 120, 0.08);
}

.favorite-card {
  cursor: pointer;

  img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
  }

  div {
    padding: 14px;
  }
}

.favorite-card h3,
.download-row h3 {
  margin: 0;
  overflow: hidden;
  color: $color-text-main;
  font-size: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.favorite-card span,
.download-row span {
  display: block;
  margin-top: 6px;
  color: $color-text-light;
  font-size: 12px;
}

.record-list {
  display: grid;
  gap: 14px;
}

.download-row {
  display: grid;
  grid-template-columns: 78px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 10px 14px 10px 10px;

  img {
    width: 78px;
    height: 58px;
    object-fit: cover;
    border-radius: 16px;
  }

  button {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    color: $color-primary;
    cursor: pointer;
    background: #ffe9f0;
    border: 0;
    border-radius: 50%;
  }
}

.empty-state {
  display: grid;
  justify-items: center;
  min-height: 480px;
  align-content: center;
  text-align: center;

  h3 {
    margin: 18px 0 0;
    color: $color-primary;
    font-size: 32px;
    font-weight: 500;
  }

  p {
    max-width: 480px;
    margin: 14px 0 0;
    color: $color-text-secondary;
    font-size: 17px;
    line-height: 1.8;
  }

  button {
    @include peach-button;

    min-width: 160px;
    min-height: 52px;
    margin-top: 28px;
    cursor: pointer;
  }
}

.profile-form {
  display: grid;
  max-width: 560px;
  gap: 18px;

  label {
    display: grid;
    gap: 10px;
    color: $color-text-secondary;
  }

  label span,
  .profile-note {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  input {
    min-height: 50px;
    padding: 0 18px;
    color: $color-text-main;
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(161, 72, 120, 0.14);
    border-radius: $radius-pill;
    outline: none;
  }
}

.message-form {
  display: grid;
  gap: 12px;
  padding: 16px;
  margin-bottom: 22px;
  background: rgba(255, 248, 251, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 24px;

  textarea {
    min-height: 124px;
    padding: 16px;
    color: $color-text-main;
    line-height: 1.7;
    resize: vertical;
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(161, 72, 120, 0.14);
    border-radius: 20px;
    outline: none;
  }
}

.message-form-footer,
.message-card-head,
.message-pager {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.message-form-footer {
  color: $color-text-light;
  font-size: 13px;

  button {
    @include peach-button;

    min-width: 126px;
    min-height: 42px;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.58;
    }
  }
}

.message-list {
  display: grid;
  gap: 14px;
}

.message-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  background:
    radial-gradient(circle at 94% 10%, rgba(234, 223, 255, 0.42), transparent 32%),
    rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.08);
  border-radius: 22px;

  p {
    margin: 0;
    color: $color-text-main;
    line-height: 1.8;
    white-space: pre-wrap;
  }

  small,
  time {
    color: $color-text-light;
    font-size: 13px;
    line-height: 1.6;
  }
}

.message-status {
  padding: 6px 12px;
  color: $color-primary;
  background: rgba(255, 214, 229, 0.58);
  border-radius: $radius-pill;

  &.is-success {
    color: #2f9e67;
    background: rgba(216, 245, 229, 0.82);
  }

  &.is-block {
    color: #c64357;
    background: rgba(255, 226, 233, 0.9);
  }
}

.message-pager {
  justify-content: center;
  margin-top: 22px;

  button {
    min-height: 38px;
    padding: 0 16px;
    color: $color-primary;
    cursor: pointer;
    background: rgba(255, 241, 246, 0.9);
    border: 0;
    border-radius: $radius-pill;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.46;
    }
  }
}

.dialog-input {
  width: 100%;
  min-height: 44px;
  padding: 0 16px;
  color: $color-text-main;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(161, 72, 120, 0.16);
  border-radius: $radius-pill;
  outline: none;
}

.profile-note {
  color: $color-text-light;
  font-size: 14px;
}

.save-button {
  @include peach-button;

  width: 150px;
  min-height: 48px;
  cursor: pointer;
}

.profile-extra {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 36px;

  div {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 54px;
    padding: 0 18px;
    color: $color-primary;
    background: rgba(255, 239, 245, 0.82);
    border-radius: 18px;
  }
}

.mini-skeleton {
  height: 320px;
  background: linear-gradient(
    90deg,
    rgba(255, 240, 247, 0.4),
    rgba(255, 255, 255, 0.72),
    rgba(255, 240, 247, 0.4)
  );
  background-size: 220% 100%;
  border-radius: 28px;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  to {
    background-position: -220% 0;
  }
}

@media (max-width: 980px) {
  .profile-view {
    padding: 42px 18px 72px;
  }

  .profile-shell {
    grid-template-columns: 1fr;
  }

  .content-panel {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .record-grid,
  .profile-extra {
    grid-template-columns: 1fr;
  }

  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}

/* ── 未登录引导区域 ── */
.login-prompt {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  min-height: 460px;
}

.prompt-card {
  display: grid;
  gap: 16px;
  place-items: center;
  max-width: 420px;
  padding: 42px 34px;
  text-align: center;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 30px;
  box-shadow: $shadow-soft;
  backdrop-filter: blur(18px);

  h2 {
    margin: 0;
    color: $color-primary;
    font-size: 26px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: $color-text-secondary;
    font-size: 15px;
    line-height: 1.9;
  }
}

.prompt-login-button {
  min-width: 160px;
  min-height: 44px;
  padding: 0 28px;
  color: $color-text-white;
  cursor: pointer;
  background: linear-gradient(135deg, #ff8fba 0%, #ac8aff 100%);
  border: 0;
  border-radius: $radius-pill;
  box-shadow: 0 10px 24px rgba(161, 72, 120, 0.16);
  font-size: 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(161, 72, 120, 0.2);
  }
}

.prompt-guest-button {
  min-width: 160px;
  min-height: 44px;
  padding: 0 28px;
  color: $color-primary;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(244, 139, 181, 0.22);
  border-radius: $radius-pill;
  font-size: 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(161, 72, 120, 0.1);
  }
}
</style>
