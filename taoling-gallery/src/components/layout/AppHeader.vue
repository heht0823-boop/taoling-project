<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import { useUserStore } from '@/stores/user'
import { resolveAvatarImageUrl } from '@/utils/image'
import { notifySuccess } from '@/utils/notify'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const logoutVisible = ref(false)

const navItems = computed(() => {
  const items = [
    { label: '首页', path: '/home' },
    { label: '图库', path: '/gallery' },
    { label: '桃灵助手', path: '/assistant' },
    { label: '我的', path: '/profile' },
  ]

  if (userStore.isAdmin) {
    items.push({ label: '控制台', path: '/admin' })
  }

  return items
})
const displayAvatarUrl = computed(() =>
  resolveAvatarImageUrl(userStore.avatarUrl, userStore.avatarThumbnailUrl),
)

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function goAuth() {
  await router.push('/auth')
}

function openLogoutDialog() {
  logoutVisible.value = true
}

async function confirmLogout() {
  await userStore.logout()
  logoutVisible.value = false
  notifySuccess('已经退出登录，桃灵会在图库入口等你')
  await router.push('/auth')
}
</script>

<template>
  <header class="app-header">
    <RouterLink class="brand" to="/home" aria-label="返回桃灵图库首页">
      <img
        class="brand-mark"
        src="/static/icons/nav/brand-leaf.svg"
        alt=""
        width="24"
        height="24"
        decoding="async"
        aria-hidden="true"
      />
      <span class="brand-name">桃灵图库</span>
    </RouterLink>

    <nav class="nav-list" aria-label="主导航">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        class="nav-link"
        :class="{ 'is-active': isActive(item.path) }"
        :to="item.path"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="user-area">
      <button v-if="!userStore.isLoggedIn" class="auth-button" type="button" @click="goAuth">
        登录/注册
      </button>

      <template v-else>
        <div class="user-chip" aria-label="当前登录用户">
          <img
            class="user-avatar"
            :src="displayAvatarUrl"
            :alt="`${userStore.displayName}头像`"
            width="34"
            height="34"
            loading="eager"
            fetchpriority="low"
            decoding="async"
          />
          <span class="user-name">{{ userStore.displayName }}</span>
        </div>
        <button class="logout-button" type="button" @click="openLogoutDialog">退出登录</button>
      </template>
    </div>

    <ConfirmDialog
      v-model="logoutVisible"
      danger
      title="确认退出登录吗？"
      description="退出后会回到登录注册页，也可以继续用游客身份进入桃灵图库。"
      confirm-text="退出登录"
      cancel-text="再逛一会"
      @confirm="confirmLogout"
    />
  </header>
</template>

<style scoped lang="scss">
.app-header {
  position: fixed;
  top: 28px;
  right: clamp(18px, 3vw, 42px);
  left: clamp(18px, 3vw, 42px);
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
  align-items: center;
  min-height: 72px;
  padding: 0 clamp(22px, 3vw, 42px);
  background: rgba(255, 250, 252, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 0 0 30px 30px;
  box-shadow: 0 18px 44px rgba(244, 139, 181, 0.13);
  backdrop-filter: blur(18px);
}

.brand {
  display: inline-flex;
  gap: 14px;
  align-items: center;
  width: fit-content;
}

.brand-mark {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: drop-shadow(0 8px 14px rgba(161, 72, 120, 0.18));
}

.brand-name {
  color: transparent;
  font-size: clamp(30px, 3vw, 44px);
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
  background: linear-gradient(90deg, $color-primary 0%, $color-secondary 100%);
  background-clip: text;
}

.nav-list {
  display: flex;
  gap: clamp(22px, 3vw, 42px);
  align-items: center;
  justify-content: center;
}

.nav-link {
  position: relative;
  padding: 9px 0;
  color: $color-text-secondary;
  font-size: 17px;
  transition: color 0.2s ease;

  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    content: "";
    background: $color-primary;
    border-radius: 999px;
    opacity: 0;
    transform: scaleX(0.4);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  &.is-active {
    color: $color-primary;
    font-size: 24px;
  }

  &.is-active::after {
    opacity: 1;
    transform: scaleX(1);
  }
}

.user-area {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  justify-self: end;
}

.user-chip {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  max-width: 210px;
  min-height: 42px;
  padding: 4px 14px 4px 5px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.86);
  border-radius: $radius-pill;
  box-shadow: 0 12px 28px rgba(161, 72, 120, 0.1);
}

.user-avatar {
  width: 34px;
  height: 34px;
  object-fit: cover;
  background: #fff8fb;
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  box-shadow: 0 6px 16px rgba(161, 72, 120, 0.14);
}

.user-name {
  overflow: hidden;
  color: $color-text-main;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.auth-button,
.logout-button {
  min-width: 120px;
  min-height: 34px;
  padding: 0 24px;
  color: $color-text-white;
  cursor: pointer;
  background: linear-gradient(135deg, #ff8fba 0%, #ac8aff 100%);
  border: 0;
  border-radius: $radius-pill;
  box-shadow: 0 10px 24px rgba(161, 72, 120, 0.16);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(161, 72, 120, 0.2);
  }
}

.logout-button {
  min-width: 96px;
  color: $color-primary;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(244, 139, 181, 0.24);
  box-shadow: 0 10px 22px rgba(161, 72, 120, 0.08);
}

@media (max-width: 860px) {
  .app-header {
    position: sticky;
    top: 0;
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 18px;
    border-radius: 0 0 24px 24px;
  }

  .brand,
  .user-area {
    justify-self: center;
  }

  .user-area {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-list {
    flex-wrap: wrap;
    gap: 16px 24px;
  }

  .nav-link.is-active {
    font-size: 19px;
  }
}
</style>
