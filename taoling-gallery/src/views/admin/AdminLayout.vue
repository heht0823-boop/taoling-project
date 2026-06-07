<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import {
  DataAnalysis,
  Folder,
  Message,
  Picture,
  Tickets,
  UploadFilled,
  User,
} from '@element-plus/icons-vue'

const route = useRoute()

const menuItems = [
  { label: '管理中心', path: '/admin/dashboard', icon: DataAnalysis, desc: '统计与最近动态' },
  { label: '上传图片', path: '/admin/upload', icon: UploadFilled, desc: '发布新的 AI 图片' },
  { label: '图片管理', path: '/admin/images', icon: Picture, desc: '维护图片状态与信息' },
  { label: '分类标签', path: '/admin/categories', icon: Folder, desc: '整理分类和标签' },
  { label: '用户日志', path: '/admin/users', icon: User, desc: '用户状态与操作记录' },
  { label: '留言管理', path: '/admin/messages', icon: Message, desc: '查看留言并回复' },
]

const activeTitle = computed(() => menuItems.find((item) => route.path.startsWith(item.path))?.label)
</script>

<template>
  <main class="admin-shell">
    <section class="admin-hero">
      <div>
        <span class="hero-kicker">
          <ElIcon><Tickets /></ElIcon>
          桃灵图库控制台
        </span>
        <h1>{{ activeTitle || '管理中心' }}</h1>
        <p>管理员在这里发布图片、维护图库分类标签、查看用户状态和系统日志。</p>
      </div>
    </section>

    <section class="admin-workspace">
      <aside class="admin-sidebar" aria-label="管理端二级导航">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          class="side-link"
          :class="{ 'is-active': route.path.startsWith(item.path) }"
          :to="item.path"
        >
          <ElIcon><component :is="item.icon" /></ElIcon>
          <span>
            <strong>{{ item.label }}</strong>
            <small>{{ item.desc }}</small>
          </span>
        </RouterLink>
      </aside>

      <div class="admin-content">
        <RouterView />
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.admin-shell {
  min-height: 100vh;
  padding: 150px clamp(18px, 5vw, 92px) 92px;
}

.admin-hero {
  padding: 34px clamp(28px, 5vw, 56px);
  margin-bottom: 28px;
  background:
    radial-gradient(circle at 86% 20%, rgba(197, 182, 255, 0.32), transparent 30%),
    linear-gradient(135deg, rgba(255, 241, 246, 0.95), rgba(255, 250, 252, 0.82));
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 34px;
  box-shadow: 0 20px 56px rgba(161, 72, 120, 0.08);
}

.hero-kicker {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: $color-primary;
}

h1 {
  margin: 12px 0 10px;
  color: $color-text-main;
  font-size: clamp(30px, 4vw, 42px);
  font-weight: 600;
  letter-spacing: 0;
}

p {
  margin: 0;
  color: $color-text-secondary;
  line-height: 1.8;
}

.admin-workspace {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.admin-sidebar {
  position: sticky;
  top: 128px;
  display: grid;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 28px;
  box-shadow: $shadow-soft;
  backdrop-filter: blur(18px);
}

.side-link {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  color: $color-text-secondary;
  border-radius: 20px;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;

  .el-icon {
    display: grid;
    width: 42px;
    height: 42px;
    place-items: center;
    color: $color-primary;
    background: rgba(255, 214, 229, 0.46);
    border-radius: 16px;
  }

  strong,
  small {
    display: block;
  }

  strong {
    color: $color-text-main;
    font-weight: 600;
  }

  small {
    margin-top: 4px;
    color: $color-text-light;
    font-size: 12px;
  }

  &.is-active,
  &:hover {
    color: $color-primary;
    background: linear-gradient(135deg, rgba(255, 214, 229, 0.72), rgba(234, 223, 255, 0.58));
    transform: translateY(-2px);
  }
}

.admin-content {
  min-width: 0;
}

@media (max-width: 980px) {
  .admin-workspace {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .admin-shell {
    padding-top: 34px;
  }

  .admin-sidebar {
    grid-template-columns: 1fr;
  }
}
</style>
