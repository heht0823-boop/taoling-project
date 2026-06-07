<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChatDotRound,
  Clock,
  Download,
  Picture,
  RefreshRight,
  Star,
  UploadFilled,
  User,
  View,
} from '@element-plus/icons-vue'

import TaolingMascot from '@/components/business/TaolingMascot.vue'
import { useAdminStore } from '@/stores/admin'
import { formatCount, formatDateTime } from '@/utils/image'

const adminStore = useAdminStore()
const router = useRouter()

const stats = computed(() => adminStore.dashboardStats)
const statCards = computed(() => [
  {
    label: '图片总数',
    value: stats.value?.image_count ?? 0,
    icon: Picture,
    color: 'pink',
  },
  {
    label: '用户数量',
    value: stats.value?.user_count ?? 0,
    icon: User,
    color: 'purple',
  },
  {
    label: '累计浏览',
    value: stats.value?.total_view_count ?? 0,
    icon: View,
    color: 'blue',
  },
  {
    label: '累计下载',
    value: stats.value?.total_download_count ?? 0,
    icon: Download,
    color: 'blue',
  },
  {
    label: '收藏总数',
    value: stats.value?.total_favorite_count ?? 0,
    icon: Star,
    color: 'pink',
  },
  {
    label: 'AI 会话',
    value: stats.value?.ai_conversation_count ?? 0,
    icon: ChatDotRound,
    color: 'purple',
  },
])

onMounted(() => {
  adminStore.fetchDashboardStats()
  adminStore.fetchLogs({ page: 1, pageSize: 6 })
})

function refreshDashboard() {
  adminStore.fetchDashboardStats({ force: true })
  adminStore.fetchLogs({ page: 1, pageSize: 6 }, { force: true })
}
</script>

<template>
  <div class="dashboard-page">
    <section class="welcome-panel">
      <div class="welcome-copy">
        <span>今日工作台</span>
        <h2>欢迎回来，继续把灵感收进图库吧</h2>
        <p>统计、上传、分类、用户和日志都集中在这里，方便你维护桃灵图库的真实业务闭环。</p>
        <button type="button" @click="router.push('/admin/upload')">
          <ElIcon><UploadFilled /></ElIcon>
          上传新图片
        </button>
        <button class="plain-action" type="button" @click="refreshDashboard">
          <ElIcon><RefreshRight /></ElIcon>
          刷新数据
        </button>
      </div>
      <TaolingMascot state="guide" size="md" />
    </section>

    <section class="stats-grid" aria-label="管理统计">
      <article v-for="card in statCards" :key="card.label" class="stat-card" :class="`tone-${card.color}`">
        <ElIcon><component :is="card.icon" /></ElIcon>
        <span>{{ card.label }}</span>
        <strong>{{ formatCount(card.value) }}</strong>
      </article>
    </section>

    <section class="activity-panel">
      <div class="section-title">
        <h3>
          <ElIcon><Clock /></ElIcon>
          最近动态
        </h3>
        <button type="button" @click="router.push('/admin/users')">查看日志</button>
      </div>

      <div v-if="adminStore.loading && !adminStore.logs.length" class="soft-state">正在读取最新动态...</div>
      <div v-else-if="!adminStore.logs.length" class="soft-state">暂时没有管理日志，桃灵会持续记录关键操作。</div>
      <ul v-else class="log-list">
        <li v-for="log in adminStore.logs" :key="log.id">
          <span class="log-dot" />
          <div>
            <strong>{{ log.title || log.action_type }}</strong>
            <p>{{ log.content || `${log.actor_name || '管理员'} 操作了 ${log.target_type}` }}</p>
          </div>
          <time>{{ formatDateTime(log.created_at) }}</time>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.dashboard-page {
  display: grid;
  gap: 24px;
}

.welcome-panel,
.activity-panel,
.stat-card {
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 30px;
  box-shadow: $shadow-soft;
  backdrop-filter: blur(18px);
}

.welcome-panel {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: center;
  padding: clamp(28px, 5vw, 48px);
  background:
    radial-gradient(circle at 86% 16%, rgba(255, 214, 229, 0.58), transparent 34%),
    linear-gradient(135deg, rgba(255, 241, 246, 0.96), rgba(255, 255, 255, 0.82));
}

.welcome-copy {
  span {
    color: $color-primary;
  }

  h2 {
    margin: 12px 0;
    color: $color-text-main;
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 600;
    letter-spacing: 0;
  }

  p {
    max-width: 620px;
    margin: 0 0 24px;
    color: $color-text-secondary;
    line-height: 1.9;
  }

  button {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 44px;
    padding: 0 24px;
    color: $color-text-white;
    cursor: pointer;
    background: $gradient-primary;
    border: 0;
    border-radius: $radius-pill;
    box-shadow: $shadow-button;
  }

  .plain-action {
    margin-left: 12px;
    color: $color-primary;
    background: rgba(255, 255, 255, 0.74);
    border: 1px solid rgba(244, 139, 181, 0.18);
    box-shadow: none;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  display: grid;
  gap: 10px;
  min-height: 148px;
  padding: 24px;

  .el-icon {
    display: grid;
    width: 42px;
    height: 42px;
    place-items: center;
    color: $color-primary;
    background: rgba(255, 214, 229, 0.58);
    border-radius: 16px;
  }

  span {
    color: $color-text-secondary;
  }

  strong {
    color: $color-text-main;
    font-size: clamp(30px, 4vw, 44px);
    font-weight: 500;
  }
}

.tone-purple .el-icon {
  color: $color-secondary;
  background: rgba(234, 223, 255, 0.72);
}

.tone-blue .el-icon {
  color: #1882aa;
  background: rgba(191, 233, 255, 0.66);
}

.activity-panel {
  padding: 28px;
}

.section-title {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;

  h3 {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    margin: 0;
    color: $color-text-main;
    font-size: 22px;
    font-weight: 600;
  }

  button {
    color: $color-primary;
    cursor: pointer;
    background: transparent;
    border: 0;
  }
}

.log-list {
  display: grid;
  gap: 12px;
  padding: 0;
  margin: 24px 0 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 18px 1fr auto;
    gap: 14px;
    align-items: center;
    padding: 16px;
    background: rgba(255, 248, 251, 0.72);
    border-radius: 18px;
  }

  strong {
    color: $color-text-main;
  }

  p,
  time {
    margin: 4px 0 0;
    color: $color-text-light;
    font-size: 13px;
  }
}

.log-dot {
  width: 10px;
  height: 10px;
  background: $gradient-primary;
  border-radius: 50%;
}

.soft-state {
  padding: 34px;
  margin-top: 22px;
  color: $color-text-light;
  text-align: center;
  background: rgba(255, 248, 251, 0.72);
  border-radius: 22px;
}

@media (max-width: 900px) {
  .welcome-panel,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-panel {
    text-align: center;
  }
}
</style>
