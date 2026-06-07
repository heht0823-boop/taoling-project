<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  ChatDotRound,
  Collection,
  CollectionTag,
  Download,
  MagicStick,
  PictureRounded,
  Search,
} from '@element-plus/icons-vue'

import TaolingMascot, { type TaolingMascotState } from '@/components/business/TaolingMascot.vue'

const router = useRouter()
const mascotState = ref<TaolingMascotState>('welcome')
const showIntro = ref(false)

const guideCards = [
  {
    icon: PictureRounded,
    title: '灵感图库',
    text: '集中展示管理员发布的 AI 图片，游客也能轻松浏览、搜索和筛选。',
  },
  {
    icon: Search,
    title: '发现线索',
    text: '通过分类、标签与关键词找到合适画面，让灵感不再散落。',
  },
  {
    icon: Collection,
    title: '收藏下载',
    text: '登录用户可以收藏喜欢的图片，下载后也能查看自己的下载记录。',
  },
  {
    icon: ChatDotRound,
    title: '桃灵助手',
    text: '桃灵会陪你整理图片灵感、生成提示词方向，并给出温柔的小建议。',
  },
  {
    icon: MagicStick,
    title: '图片需求留言',
    text: '如果你需要某类图片制作，可以在留言里告诉管理员，审核通过后管理员会参考需求帮你实现。',
  },
]

const adminItems = [
  { icon: MagicStick, label: '发布 AI 图片' },
  { icon: CollectionTag, label: '管理分类标签' },
  { icon: Download, label: '查看用户与日志' },
]

async function browseGallery() {
  await router.push('/gallery')
}

async function goMessages() {
  await router.push('/messages')
}

function introduceTaoling() {
  showIntro.value = true
  mascotState.value = 'guide'
}

function backHome() {
  showIntro.value = false
  mascotState.value = 'welcome'
}
</script>

<template>
  <section class="home-view">
    <div class="home-glow home-glow--top" />
    <div class="home-glow home-glow--bottom" />

    <Transition name="home-panel" mode="out-in">
      <div v-if="!showIntro" key="hero" class="hero-card">
        <div class="hero-copy">
          <span class="soft-label">Taoling Inspiration Island</span>
          <h1>探索灵感之岛</h1>
          <p>邂逅 AI 创造的梦幻视界，让桃灵带你漫游奇思妙想的艺术图库。</p>

          <div class="hero-actions">
            <button class="primary-action" type="button" @click="browseGallery">开始浏览</button>
            <button class="secondary-action" type="button" @click="introduceTaoling">认识桃灵</button>
          </div>
        </div>

        <div class="hero-mascot">
          <TaolingMascot :state="mascotState" autoplay priority size="lg" />
        </div>
      </div>

      <div v-else key="intro" class="intro-card">
        <div class="intro-copy">
          <button class="back-button" type="button" @click="backHome">
            <ElIcon><ArrowLeft /></ElIcon>
            返回首页
          </button>

          <span class="soft-label">Meet Tao Ling</span>
          <h1>桃灵会把灵感轻轻递给你</h1>
          <p>
            桃灵图库是一个浅桃粉紫的 AI 图片灵感展厅。桃灵负责陪你发现图片、整理灵感，也在空状态、引导和助手场景里给出可爱的动态反馈。
          </p>

          <div class="intro-actions">
            <button class="primary-action" type="button" @click="browseGallery">去图库看看</button>
            <button class="secondary-action" type="button" @click="goMessages">去留言板</button>
            <button class="secondary-action" type="button" @click="backHome">回到入口</button>
          </div>
        </div>

        <div class="intro-mascot">
          <TaolingMascot state="guide" autoplay size="md" />
          <div class="bubble bubble--one">发现图片</div>
          <div class="bubble bubble--two">整理灵感</div>
          <div class="bubble bubble--three">温柔提醒</div>
        </div>

        <div class="guide-grid">
          <article v-for="item in guideCards" :key="item.title" class="guide-card">
            <span class="guide-icon">
              <ElIcon><component :is="item.icon" /></ElIcon>
            </span>
            <h2>{{ item.title }}</h2>
            <p>{{ item.text }}</p>
          </article>
        </div>

        <div class="admin-strip">
          <span class="admin-title">管理员只负责图库秩序</span>
          <span v-for="item in adminItems" :key="item.label" class="admin-pill">
            <ElIcon><component :is="item.icon" /></ElIcon>
            {{ item.label }}
          </span>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped lang="scss">
.home-view {
  position: relative;
  min-height: calc(100vh - 112px);
  overflow: hidden;
  padding: 220px clamp(28px, 7vw, 108px) 82px;
  background:
    radial-gradient(circle at 12% 3%, rgba(255, 151, 188, 0.2), transparent 32%),
    radial-gradient(circle at 85% 12%, rgba(197, 182, 255, 0.16), transparent 28%),
    linear-gradient(180deg, #fff9fb 0%, #fff4f8 100%);
}

.home-glow {
  position: absolute;
  width: 42vw;
  max-width: 560px;
  aspect-ratio: 1;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(22px);
}

.home-glow--top {
  top: -24%;
  left: -7%;
  background: radial-gradient(circle, rgba(255, 139, 181, 0.26), transparent 68%);
}

.home-glow--bottom {
  right: -11%;
  bottom: 10%;
  background: radial-gradient(circle, rgba(197, 182, 255, 0.22), transparent 70%);
}

.hero-card {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(300px, 520px);
  gap: clamp(32px, 5vw, 82px);
  align-items: center;
  max-width: 1250px;
  min-height: 460px;
  margin: 0 auto;
  padding: clamp(38px, 5vw, 72px) clamp(42px, 7vw, 112px);
  background: rgba(255, 246, 249, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 36px;
  box-shadow:
    0 24px 62px rgba(161, 72, 120, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
}

.intro-card {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(300px, 0.9fr) minmax(270px, 0.7fr);
  gap: clamp(24px, 4vw, 52px);
  align-items: center;
  max-width: 1250px;
  min-height: 560px;
  margin: 0 auto;
  padding: clamp(30px, 4vw, 54px);
  overflow: hidden;
  background:
    radial-gradient(circle at 70% 10%, rgba(255, 217, 229, 0.72), transparent 30%),
    radial-gradient(circle at 12% 84%, rgba(211, 238, 255, 0.64), transparent 34%),
    rgba(255, 247, 250, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.68);
  border-radius: 36px;
  box-shadow:
    0 24px 62px rgba(161, 72, 120, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(16px);
}

.hero-copy {
  max-width: 560px;
}

.intro-copy {
  position: relative;
  z-index: 2;
}

.soft-label {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 14px;
  margin-bottom: 18px;
  color: $color-primary;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(244, 139, 181, 0.2);
  border-radius: $radius-pill;
  box-shadow: 0 10px 22px rgba(161, 72, 120, 0.06);
}

h1 {
  margin: 0;
  color: #2f242f;
  font-size: clamp(36px, 4.1vw, 52px);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

p {
  max-width: 560px;
  margin: 28px 0 0;
  color: $color-text-secondary;
  font-size: clamp(16px, 1.7vw, 20px);
  line-height: 1.8;
}

.back-button {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 38px;
  padding: 0 16px;
  margin-bottom: 20px;
  color: $color-primary;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(244, 139, 181, 0.22);
  border-radius: $radius-pill;
  box-shadow: 0 12px 26px rgba(161, 72, 120, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 28px rgba(161, 72, 120, 0.12);
  }
}

.hero-actions {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-top: 36px;
}

.intro-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 30px;
}

.primary-action,
.secondary-action {
  min-width: 146px;
  min-height: 58px;
  padding: 0 30px;
  font-size: 20px;
  cursor: pointer;
  border: 0;
  border-radius: $radius-pill;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.primary-action {
  color: $color-text-white;
  background: linear-gradient(135deg, $color-primary 0%, $color-secondary 100%);
  box-shadow: 0 14px 28px rgba(161, 72, 120, 0.22);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 34px rgba(161, 72, 120, 0.28);
  }
}

.secondary-action {
  color: $color-primary;
  background: rgba(255, 255, 255, 0.78);

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 240, 247, 0.96);
    box-shadow: 0 12px 24px rgba(161, 72, 120, 0.1);
  }
}

.hero-mascot {
  display: grid;
  place-items: center;
  min-height: 320px;
}

.intro-mascot {
  position: relative;
  display: grid;
  min-height: 300px;
  place-items: center;

  &::before {
    position: absolute;
    width: min(330px, 86%);
    aspect-ratio: 1;
    content: '';
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.9) 0 48%, transparent 49%),
      radial-gradient(circle, rgba(255, 181, 209, 0.26), transparent 68%);
    border-radius: 50%;
    filter: drop-shadow(0 20px 35px rgba(161, 72, 120, 0.12));
    animation: haloPulse 4s ease-in-out infinite;
  }
}

.bubble {
  position: absolute;
  min-height: 34px;
  padding: 8px 14px;
  color: $color-primary;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: $radius-pill;
  box-shadow: 0 12px 26px rgba(161, 72, 120, 0.1);
  animation: floatBubble 4.8s ease-in-out infinite;
}

.bubble--one {
  top: 20px;
  left: 8%;
}

.bubble--two {
  right: 4%;
  bottom: 76px;
  animation-delay: 0.8s;
}

.bubble--three {
  bottom: 24px;
  left: 18%;
  animation-delay: 1.4s;
}

.guide-grid {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
}

.guide-card {
  position: relative;
  min-height: 184px;
  padding: 22px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 24px;
  box-shadow: 0 16px 32px rgba(161, 72, 120, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &::after {
    position: absolute;
    right: -34px;
    bottom: -42px;
    width: 104px;
    aspect-ratio: 1;
    content: '';
    background: radial-gradient(circle, rgba(255, 151, 188, 0.2), transparent 68%);
    border-radius: 50%;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 22px 42px rgba(161, 72, 120, 0.12);
  }

  h2 {
    margin: 18px 0 0;
    color: $color-text-main;
    font-size: 20px;
    font-weight: 600;
  }

  p {
    margin: 10px 0 0;
    font-size: 14px;
    line-height: 1.7;
  }
}

.guide-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  color: $color-text-white;
  font-size: 22px;
  background: linear-gradient(135deg, #ff8fba 0%, #ac8aff 100%);
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(161, 72, 120, 0.18);
}

.admin-strip {
  display: flex;
  grid-column: 1 / -1;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 22px;
}

.admin-title {
  flex: 0 0 auto;
  color: $color-text-main;
  font-weight: 600;
}

.admin-pill {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 8px;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  color: $color-primary;
  background: rgba(255, 243, 247, 0.86);
  border-radius: $radius-pill;
}

.home-panel-enter-active,
.home-panel-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.home-panel-enter-from,
.home-panel-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.99);
}

@keyframes haloPulse {
  0%,
  100% {
    transform: scale(0.96);
  }

  50% {
    transform: scale(1.04);
  }
}

@keyframes floatBubble {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 920px) {
  .home-view {
    padding: 46px 18px 64px;
  }

  .hero-card {
    grid-template-columns: 1fr;
    gap: 22px;
    padding: 42px 24px;
    text-align: center;
  }

  .intro-card {
    grid-template-columns: 1fr;
    padding: 34px 22px;
    text-align: center;
  }

  .hero-copy {
    justify-self: center;
  }

  .hero-actions,
  .intro-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .hero-mascot {
    min-height: 260px;
  }

  .guide-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    text-align: left;
  }

  .admin-strip {
    justify-content: flex-start;
    text-align: left;
  }
}

@media (max-width: 520px) {
  .home-view {
    padding-top: 28px;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .guide-grid {
    grid-template-columns: 1fr;
  }

  .bubble {
    display: none;
  }
}
</style>
