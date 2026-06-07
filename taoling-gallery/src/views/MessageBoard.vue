<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import type { CSSProperties } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'

import TaolingMascot from '@/components/business/TaolingMascot.vue'
import { useMessageStore } from '@/stores/message'
import type { PublicMessage } from '@/types/message'
import { formatDateTime } from '@/utils/image'

const messageStore = useMessageStore()

const filters = reactive({
  page: 1,
  pageSize: 24,
})

const rainMessages = computed(() =>
  messageStore.publicMessages.map((message, index) => ({
    message,
    style: createRainStyle(index),
  })),
)

onMounted(() => {
  fetchMessages()
})

function fetchMessages(options: { force?: boolean } = {}) {
  return messageStore.fetchPublicMessages(filters, options)
}

function createRainStyle(index: number): CSSProperties {
  const column = index % 6
  const drift = index % 2 === 0 ? 1 : -1
  const left = 24 + column * 9.5 + (index % 3) * 1.5
  const duration = 13 + (index % 6) * 1.4
  const delay = -(index % 10) * 1.6

  return {
    '--rain-left': `${Math.min(left, 76)}%`,
    '--rain-duration': `${duration}s`,
    '--rain-delay': `${delay}s`,
    '--rain-drift': `${drift * (18 + (index % 4) * 8)}px`,
    '--rain-scale': `${0.92 + (index % 5) * 0.03}`,
  } as CSSProperties
}

function displayUser(message: PublicMessage) {
  return message.user?.username || '桃灵访客'
}

function prevPage() {
  filters.page--
  fetchMessages({ force: true })
}

function nextPage() {
  filters.page++
  fetchMessages({ force: true })
}
</script>

<template>
  <section class="message-board-view">
    <div class="board-glow board-glow--top" />
    <div class="board-glow board-glow--bottom" />

    <header class="board-hero">
      <div>
        <span class="soft-label">Taoling Message Rain</span>
        <h1>桃灵留言板</h1>
        <p>公开展示审核通过的留言与回复，让温柔反馈像桃花雨一样落进图库。</p>
      </div>
      <TaolingMascot state="happy" autoplay size="md" />
    </header>

    <section class="rain-stage" aria-label="公开留言雨">
      <div v-if="messageStore.loading && !messageStore.publicMessages.length" class="stage-state">
        <TaolingMascot state="loading" autoplay size="sm" />
        <p>正在收集留言...</p>
      </div>

      <div v-else-if="!messageStore.publicMessages.length" class="stage-state">
        <TaolingMascot state="empty" autoplay size="sm" />
        <p>还没有公开留言。</p>
      </div>

      <article
        v-for="{ message, style } in rainMessages"
        v-else
        :key="message.id"
        class="rain-message"
        :style="style"
      >
        <div class="rain-card">
          <div class="rain-card-head">
            <strong>{{ displayUser(message) }}</strong>
            <time>{{ formatDateTime(message.created_at) }}</time>
          </div>
          <p>{{ message.content }}</p>
          <div v-if="message.replies?.length" class="reply-stack">
            <span v-for="reply in message.replies" :key="reply.id">
              桃灵回复：{{ reply.content }}
            </span>
          </div>
        </div>
      </article>
    </section>

    <footer class="board-actions">
      <button type="button" :disabled="messageStore.loading" @click="fetchMessages({ force: true })">
        <ElIcon><RefreshRight /></ElIcon>
        刷新留言
      </button>
      <div v-if="messageStore.publicPagination.total > filters.pageSize" class="pager">
        <button :disabled="filters.page <= 1" type="button" @click="prevPage">上一页</button>
        <span>
          {{ messageStore.publicPagination.page }} /
          {{ messageStore.publicPagination.totalPages || 1 }}
        </span>
        <button
          :disabled="filters.page >= (messageStore.publicPagination.totalPages || 1)"
          type="button"
          @click="nextPage"
        >
          下一页
        </button>
      </div>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.message-board-view {
  position: relative;
  min-height: calc(100vh - 112px);
  overflow: hidden;
  padding: 142px clamp(20px, 6vw, 96px) 86px;
  background:
    radial-gradient(circle at 12% 6%, rgba(255, 151, 188, 0.18), transparent 32%),
    radial-gradient(circle at 88% 18%, rgba(197, 182, 255, 0.2), transparent 34%),
    linear-gradient(180deg, #fff9fb 0%, #fff5f8 58%, #fffafd 100%);
}

.board-glow {
  position: absolute;
  width: min(42vw, 520px);
  aspect-ratio: 1;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(24px);
}

.board-glow--top {
  top: -18%;
  left: -8%;
  background: radial-gradient(circle, rgba(255, 139, 181, 0.18), transparent 70%);
}

.board-glow--bottom {
  right: -12%;
  bottom: 4%;
  background: radial-gradient(circle, rgba(183, 166, 255, 0.18), transparent 70%);
}

.board-hero {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  max-width: 1120px;
  margin: 0 auto 24px;
  padding: clamp(26px, 4vw, 42px);
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 34px;
  box-shadow: 0 24px 60px rgba(161, 72, 120, 0.1);
  backdrop-filter: blur(18px);

  h1 {
    margin: 10px 0 12px;
    color: $color-text-main;
    font-size: clamp(34px, 5vw, 54px);
    font-weight: 600;
    letter-spacing: 0;
  }

  p {
    max-width: 620px;
    margin: 0;
    color: $color-text-secondary;
    font-size: 17px;
    line-height: 1.9;
  }
}

.soft-label {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  padding: 0 14px;
  color: $color-primary;
  background: rgba(255, 241, 247, 0.86);
  border: 1px solid rgba(244, 139, 181, 0.18);
  border-radius: $radius-pill;
}

.rain-stage {
  position: relative;
  z-index: 1;
  height: min(68vh, 680px);
  min-height: 520px;
  max-width: 1180px;
  margin: 0 auto;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 248, 251, 0.6)),
    radial-gradient(circle at 50% 10%, rgba(255, 214, 229, 0.5), transparent 38%);
  border: 1px solid rgba(161, 72, 120, 0.08);
  border-radius: 38px;
  box-shadow: inset 0 0 48px rgba(255, 214, 229, 0.38), $shadow-soft;
  backdrop-filter: blur(16px);
}

.rain-stage::before,
.rain-stage::after {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: clamp(42px, 9vw, 112px);
  pointer-events: none;
  content: '';
}

.rain-stage::before {
  left: 0;
  background: linear-gradient(90deg, rgba(255, 250, 252, 0.92), rgba(255, 250, 252, 0));
}

.rain-stage::after {
  right: 0;
  background: linear-gradient(270deg, rgba(255, 250, 252, 0.92), rgba(255, 250, 252, 0));
}

.stage-state {
  display: grid;
  gap: 14px;
  height: 100%;
  place-items: center;
  align-content: center;
  color: $color-text-light;
  text-align: center;

  p {
    margin: 0;
  }
}

.rain-message {
  position: absolute;
  top: 0;
  left: var(--rain-left);
  width: clamp(210px, 24vw, 310px);
  transform: translateX(-50%) scale(var(--rain-scale));
  animation: message-rain var(--rain-duration) linear var(--rain-delay) infinite;
  will-change: transform, opacity, filter;
}

.rain-card {
  padding: 16px;
  color: $color-text-main;
  background:
    radial-gradient(circle at 88% 10%, rgba(234, 223, 255, 0.46), transparent 34%),
    rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.86);
  border-radius: 24px;
  box-shadow: 0 18px 38px rgba(161, 72, 120, 0.12);
}

.rain-card-head {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;

  strong {
    min-width: 0;
    overflow: hidden;
    color: $color-primary;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  time {
    flex-shrink: 0;
    color: $color-text-light;
    font-size: 12px;
  }
}

.rain-card p {
  display: -webkit-box;
  margin: 10px 0 0;
  overflow: hidden;
  color: $color-text-secondary;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.reply-stack {
  display: grid;
  gap: 6px;
  margin-top: 12px;

  span {
    display: -webkit-box;
    overflow: hidden;
    padding: 8px 10px;
    color: #7c62cf;
    font-size: 13px;
    line-height: 1.55;
    background: rgba(234, 223, 255, 0.46);
    border-radius: 14px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

.board-actions {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: center;
  max-width: 1120px;
  margin: 26px auto 0;

  button {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 18px;
    color: $color-primary;
    cursor: pointer;
    background: rgba(255, 241, 246, 0.92);
    border: 1px solid rgba(244, 139, 181, 0.16);
    border-radius: $radius-pill;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }
  }
}

.pager {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  color: $color-text-secondary;
}

@keyframes message-rain {
  0% {
    opacity: 0;
    filter: brightness(1.05);
    transform: translate3d(-50%, -120px, 0) scale(var(--rain-scale));
  }

  12% {
    opacity: 0.96;
  }

  68% {
    opacity: 0.72;
    filter: brightness(0.9);
  }

  100% {
    opacity: 0;
    filter: brightness(0.48);
    transform: translate3d(calc(-50% + var(--rain-drift)), calc(100vh + 220px), 0)
      scale(calc(var(--rain-scale) * 0.9));
  }
}

@media (max-width: 760px) {
  .message-board-view {
    padding: 42px 16px 64px;
  }

  .board-hero {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .rain-stage {
    height: 620px;
  }

  .rain-message {
    width: min(260px, 78vw);
  }
}
</style>
