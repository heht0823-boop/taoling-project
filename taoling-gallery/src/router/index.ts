import { createRouter, createWebHistory } from 'vue-router'

import { setupRouterGuard } from './guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      redirect: '/auth',
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: {
        title: '首页',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/gallery',
      name: 'Gallery',
      component: () => import('@/views/Gallery.vue'),
      meta: {
        title: '图库',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/images/:id',
      name: 'ImageDetail',
      component: () => import('@/views/ImageDetail.vue'),
      meta: {
        title: '图片详情',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/assistant',
      name: 'Assistant',
      component: () => import('@/views/Assistant.vue'),
      meta: {
        title: '桃灵助手',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/profile',
      name: 'UserProfile',
      component: () => import('@/views/UserProfile.vue'),
      meta: {
        title: '我的',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/auth',
      name: 'Auth',
      component: () => import('@/views/Auth.vue'),
      meta: {
        title: '登录注册',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: false,
        showFooter: false,
      },
    },
    {
      path: '/permission',
      name: 'Permission',
      component: () => import('@/views/Permission.vue'),
      meta: {
        title: '权限不足',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/views/footer/About.vue'),
      meta: {
        title: '关于我们',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/privacy',
      name: 'Privacy',
      component: () => import('@/views/footer/Privacy.vue'),
      meta: {
        title: '隐私政策',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/terms',
      name: 'Terms',
      component: () => import('@/views/footer/Terms.vue'),
      meta: {
        title: '用户协议',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/contact',
      name: 'Contact',
      component: () => import('@/views/footer/Contact.vue'),
      meta: {
        title: '联系桃灵',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/messages',
      name: 'MessageBoard',
      component: () => import('@/views/MessageBoard.vue'),
      meta: {
        title: '留言板',
        requiresAuth: false,
        requiresAdmin: false,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      redirect: '/admin/dashboard',
      meta: {
        title: '控制台',
        requiresAuth: true,
        requiresAdmin: true,
        keepAlive: false,
        showHeader: true,
        showFooter: true,
      },
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/AdminDashboard.vue'),
          meta: {
            title: '管理中心',
            requiresAuth: true,
            requiresAdmin: true,
            keepAlive: false,
            showHeader: true,
            showFooter: true,
          },
        },
        {
          path: 'upload',
          name: 'AdminUpload',
          component: () => import('@/views/admin/AdminUpload.vue'),
          meta: {
            title: '上传图片',
            requiresAuth: true,
            requiresAdmin: true,
            keepAlive: false,
            showHeader: true,
            showFooter: true,
          },
        },
        {
          path: 'images',
          name: 'AdminImages',
          component: () => import('@/views/admin/AdminImages.vue'),
          meta: {
            title: '图片管理',
            requiresAuth: true,
            requiresAdmin: true,
            keepAlive: false,
            showHeader: true,
            showFooter: true,
          },
        },
        {
          path: 'categories',
          name: 'AdminTaxonomy',
          component: () => import('@/views/admin/AdminTaxonomy.vue'),
          meta: {
            title: '分类标签',
            requiresAuth: true,
            requiresAdmin: true,
            keepAlive: false,
            showHeader: true,
            showFooter: true,
          },
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/AdminUsers.vue'),
          meta: {
            title: '用户日志',
            requiresAuth: true,
            requiresAdmin: true,
            keepAlive: false,
            showHeader: true,
            showFooter: true,
          },
        },
        {
          path: 'messages',
          name: 'AdminMessages',
          component: () => import('@/views/admin/AdminMessages.vue'),
          meta: {
            title: '留言管理',
            requiresAuth: true,
            requiresAdmin: true,
            keepAlive: false,
            showHeader: true,
            showFooter: true,
          },
        },
      ],
    },
  ],
})

setupRouterGuard(router)

export default router
