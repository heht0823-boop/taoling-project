import type { Router } from 'vue-router'

import { useUserStore } from '@/stores/user'

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to) => {
    const userStore = useUserStore()
    const title = typeof to.meta.title === 'string' ? to.meta.title : import.meta.env.VITE_APP_TITLE
    document.title = title ? `${title} - 桃灵图库` : '桃灵图库'

    if (!userStore.user) {
      await userStore.getMe().catch(() => null)
    }

    if (to.path === '/auth' && userStore.user) {
      return userStore.isAdmin ? '/admin/dashboard' : '/gallery'
    }

    if (to.meta.requiresAuth && !userStore.user) {
      return {
        path: '/auth',
        query: { redirect: to.fullPath },
      }
    }

    if (to.meta.requiresAdmin && !userStore.isAdmin) {
      return '/permission'
    }

    return true
  })
}
