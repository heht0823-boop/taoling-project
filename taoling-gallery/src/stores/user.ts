import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getMeApi, loginApi, logoutApi, registerApi } from '@/apis/auth'
import {
  createUserMessageApi,
  getProfileSummaryApi,
  getUserMessagesApi,
  updateProfileApi,
  uploadAvatarFileApi,
  type UpdateProfileParams,
} from '@/apis/user'
import type { AuthUser, LoginParams, RegisterParams, UserStats } from '@/types/auth'
import type { CreateUserMessageParams, UserMessage, UserMessageListParams } from '@/types/message'
import type { PageResult, Pagination } from '@/types/common'
import {
  createDisplayCacheKey,
  clearDisplayCacheScope,
  readDisplayCache,
  removeDisplayCache,
  shouldRefreshForBrowserReload,
  writeDisplayCache,
} from '@/utils/displayCache'
import { clearAuthState } from '@/utils/storage'

const defaultAvatars = [
  '/static/avatar/avatar-01.svg',
  '/static/avatar/avatar-02.svg',
  '/static/avatar/avatar-03.svg',
  '/static/avatar/avatar-04.svg',
  '/static/avatar/avatar-05.svg',
]

const defaultPagination = (): Pagination => ({
  page: 1,
  pageSize: 8,
  total: 0,
  totalPages: 0,
})

function pickDefaultAvatar(seed: string | number | undefined = 'taoling') {
  const source = String(seed || 'taoling')
  const total = Array.from(source).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return defaultAvatars[total % defaultAvatars.length]
}

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<AuthUser | null>(null)
    const stats = ref<UserStats | null>(null)
    const loading = ref(false)
    const messageLoading = ref(false)
    const avatarLoading = ref(false)
    const messages = ref<UserMessage[]>([])
    const messagePagination = ref<Pagination>(defaultPagination())

    const isLoggedIn = computed(() => Boolean(user.value))
    const isAdmin = computed(() => user.value?.role === 'admin')
    const displayName = computed(() => user.value?.username || '桃灵用户')
    const avatarUrl = computed(() => {
      if (user.value?.avatar_url) {
        return user.value.avatar_url
      }

      return pickDefaultAvatar(user.value?.id || user.value?.username || user.value?.email)
    })
    const avatarThumbnailUrl = computed(() => user.value?.avatar_thumbnail_url || null)
    const avatarSrcset = computed(() => user.value?.avatar_srcset || null)

    function resetAuthState() {
      user.value = null
      stats.value = null
      clearAuthState()
    }

    /** 登录后保存用户资料，鉴权凭证由后端写入 HttpOnly Cookie。 */
    async function login(params: LoginParams) {
      loading.value = true

      try {
        const result = await loginApi({
          account: params.account.trim(),
          password: params.password,
        })

        user.value = result.user
        stats.value = result.stats || null

        return result
      } finally {
        loading.value = false
      }
    }

    /** 注册普通用户账号，成功后沿用后端写入的 Cookie 登录态。 */
    async function register(params: RegisterParams) {
      loading.value = true

      try {
        const result = await registerApi({
          username: params.username.trim(),
          email: params.email?.trim() || undefined,
          password: params.password,
        })

        user.value = result.user
        stats.value = result.stats || null

        return result
      } finally {
        loading.value = false
      }
    }

    /** 通过浏览器自动携带的 Cookie 恢复当前登录用户。 */
    async function getMe() {
      loading.value = true

      try {
        const result = await getMeApi()
        user.value = result.user
        stats.value = result.stats || null
        return result
      } catch (error) {
        resetAuthState()
        throw error
      } finally {
        loading.value = false
      }
    }

    /** 先通知后端清除 HttpOnly Cookie，再清理本地用户状态。 */
    async function logout() {
      await logoutApi().catch(() => null)
      resetAuthState()
    }

    /** 获取用户中心概览，刷新本地用户资料和统计。 */
    async function getProfileSummary(options: { force?: boolean } = {}) {
      const cacheKey = createDisplayCacheKey('user-profile-summary', {
        userId: user.value?.id || 'current',
      })
      const cached = readDisplayCache<{ user: AuthUser; stats?: UserStats }>(cacheKey)
      if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
        user.value = cached.user
        stats.value = cached.stats || null
        return cached
      }

      loading.value = true

      try {
        const result = await getProfileSummaryApi()
        user.value = result.user
        stats.value = result.stats || null
        writeDisplayCache(cacheKey, result)
        return result
      } finally {
        loading.value = false
      }
    }

    /** 更新账号资料，成功后同步持久化用户信息。 */
    async function updateProfile(params: UpdateProfileParams) {
      loading.value = true

      try {
        const result = await updateProfileApi(params)
        user.value = { ...user.value, ...result.user } as AuthUser
        stats.value = result.stats || stats.value
        clearDisplayCacheScope('user-profile-summary')
        return result
      } finally {
        loading.value = false
      }
    }

    /** 上传本地头像。 */
    async function uploadAvatarFile(file: File) {
      avatarLoading.value = true

      try {
        const result = await uploadAvatarFileApi(file)
        // 合并而非替换：头像上传响应中的 user 对象可能不包含 email/role/status 等字段
        user.value = { ...user.value, ...result.user } as AuthUser
        stats.value = result.stats || stats.value
        // 清除资料摘要缓存，确保下次 getProfileSummary 重新拉取
        const summaryCacheKey = createDisplayCacheKey('user-profile-summary', {
          userId: user.value?.id || 'current',
        })
        removeDisplayCache(summaryCacheKey)
        // 同时清除所有 user-profile-summary 相关缓存（不同 userId 参数的变体）
        clearDisplayCacheScope('user-profile-summary')
        return result
      } finally {
        avatarLoading.value = false
      }
    }

    /** 获取当前用户留言记录。 */
    async function fetchMessages(
      params: UserMessageListParams = { page: 1, pageSize: 8 },
      options: { force?: boolean } = {},
    ) {
      const cacheKey = createDisplayCacheKey('user-messages', {
        userId: user.value?.id || 'current',
        ...params,
      })
      const cached = readDisplayCache<PageResult<UserMessage>>(cacheKey)
      if (cached && !options.force && !shouldRefreshForBrowserReload(cacheKey)) {
        messages.value = cached.list
        messagePagination.value = cached.pagination
        return cached
      }

      messageLoading.value = true

      try {
        const result = await getUserMessagesApi(params)
        messages.value = result.list
        messagePagination.value = result.pagination
        writeDisplayCache(cacheKey, result)
        return result
      } finally {
        messageLoading.value = false
      }
    }

    /** 创建留言，后端统一返回 submitted，审核结果不向用户端泄漏。 */
    async function createMessage(params: CreateUserMessageParams) {
      messageLoading.value = true

      try {
        return await createUserMessageApi(params)
      } finally {
        messageLoading.value = false
      }
    }

    return {
      user,
      stats,
      loading,
      messageLoading,
      avatarLoading,
      messages,
      messagePagination,
      isLoggedIn,
      isAdmin,
      displayName,
      avatarUrl,
      avatarThumbnailUrl,
      avatarSrcset,
      defaultAvatars,
      login,
      register,
      getMe,
      logout,
      getProfileSummary,
      updateProfile,
      uploadAvatarFile,
      fetchMessages,
      createMessage,
    }
  },
  {
    persist: {
      key: 'taoling-user',
      pick: ['user', 'stats'],
    },
  },
)
