<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back, Collection, Download, PictureRounded, Star, View } from '@element-plus/icons-vue'

import { clickGuard } from '@/utils/perform'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import ImageCard from '@/components/business/ImageCard.vue'
import TaolingMascot from '@/components/business/TaolingMascot.vue'
import { useDownloadStore } from '@/stores/download'
import { useFavoriteStore } from '@/stores/favorite'
import { useImageStore } from '@/stores/image'
import { useUserStore } from '@/stores/user'
import type { GalleryImage } from '@/types/image'
import { downloadFileFromUrl } from '@/utils/download'
import { formatCount, formatDateTime, getAspectRatioSize, resolveImageUrl } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const imageStore = useImageStore()
const favoriteStore = useFavoriteStore()
const downloadStore = useDownloadStore()
const userStore = useUserStore()

const imageId = computed(() => Number(route.params.id))
const detailImage = computed(() => imageStore.detail)
const imageUrl = computed(() =>
  resolveImageUrl(detailImage.value?.image_url || detailImage.value?.thumbnail_url),
)
const detailAspectRatio = computed(() => detailImage.value?.aspect_ratio || '1:1')
const detailImageSize = computed(() => getAspectRatioSize(detailImage.value?.aspect_ratio, 1200))

const loginVisible = ref(false)

async function loadDetail() {
  if (!imageId.value) {
    return
  }

  try {
    await imageStore.fetchImageDetail(imageId.value)
    void imageStore.recordImageView(imageId.value)
    void imageStore.fetchRelatedImages(imageId.value)
  } catch {
    imageStore.related = []
  }
}

function goGallery() {
  void router.push('/gallery')
}

function openRelated(image: GalleryImage) {
  void router.push(`/images/${image.id}`)
}

function requireLogin() {
  if (userStore.isLoggedIn) return true
  loginVisible.value = true
  return false
}

async function goLogin() {
  loginVisible.value = false
  await router.push({ path: '/auth', query: { redirect: route.fullPath } })
}

const toggleFavorite = clickGuard(async () => {
  const image = detailImage.value

  if (!image || !requireLogin()) {
    return
  }

  try {
    const result = await favoriteStore.toggleFavorite(image.id, image.is_favorited)
    imageStore.updateFavoriteState(result.image_id, result.is_favorited, result.favorite_count)
    ElMessage.success(result.is_favorited ? '已收藏到我的小岛' : '已取消收藏')
  } catch {
    ElMessage.error('收藏操作失败，请稍后再试')
  }
})

const downloadImage = clickGuard(async () => {
  const image = detailImage.value

  if (!image || !requireLogin()) {
    return
  }

  try {
    const result = await downloadStore.createDownload(image.id)
    imageStore.updateDownloadCount(result.image_id, result.download_count)
    await downloadFileFromUrl(resolveImageUrl(result.download_url), image.title || 'taoling-image')
    ElMessage.success('桃灵已经为你准备好下载')
  } catch {
    ElMessage.error('下载失败，请稍后再试')
  }
})

watch(
  () => route.params.id,
  () => {
    void loadDetail()
  },
)

onMounted(() => {
  void loadDetail()
})
</script>

<template>
  <section class="detail-view">
    <div class="detail-glow detail-glow--top" />
    <div class="detail-glow detail-glow--bottom" />

    <div class="detail-wrap">
      <button class="back-link" type="button" @click="goGallery">
        <ElIcon><Back /></ElIcon>
        图库
      </button>

      <div v-if="imageStore.loading" class="detail-skeleton">
        <div />
        <aside />
      </div>

      <div v-else-if="detailImage" class="detail-grid">
        <div class="image-stage">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="detailImage.title"
            :width="detailImageSize.width"
            :height="detailImageSize.height"
            fetchpriority="high"
            decoding="async"
          />
          <div v-else class="image-missing">
            <TaolingMascot state="empty" autoplay size="sm" />
          </div>
        </div>

        <aside class="info-card">
          <span class="soft-label">Taoling Image</span>
          <h1>{{ detailImage.title || '未命名灵感图' }}</h1>

          <div class="publish-row">
            <div class="publish-mark">
              <ElIcon><PictureRounded /></ElIcon>
            </div>
            <div>
              <strong>桃灵图库发布</strong>
              <span>{{ formatDateTime(detailImage.created_at) }}</span>
            </div>
          </div>

          <div class="metric-grid">
            <span>
              <ElIcon><View /></ElIcon>
              <small>浏览</small>
              <strong>{{ formatCount(detailImage.view_count) }}</strong>
            </span>
            <span>
              <ElIcon><Star /></ElIcon>
              <small>收藏</small>
              <strong>{{ formatCount(detailImage.favorite_count) }}</strong>
            </span>
            <span>
              <ElIcon><Download /></ElIcon>
              <small>下载</small>
              <strong>{{ formatCount(detailImage.download_count) }}</strong>
            </span>
            <span>
              <ElIcon><PictureRounded /></ElIcon>
              <small>比例</small>
              <strong>{{ detailAspectRatio }}</strong>
            </span>
          </div>

          <section class="description-block">
            <h2>作品描述</h2>
            <p>
              {{
                detailImage.description || '这张图片暂时没有描述，桃灵会等管理员补充更多灵感说明。'
              }}
            </p>
          </section>

          <div class="tag-list">
            <span v-if="detailImage.category">{{ detailImage.category.name }}</span>
            <span v-for="tag in detailImage.tags" :key="tag.id">{{ tag.name }}</span>
          </div>

          <div class="action-row">
            <button
              class="secondary-action"
              type="button"
              :disabled="favoriteStore.toggling"
              @click="toggleFavorite"
            >
              <ElIcon><Collection /></ElIcon>
              {{ detailImage.is_favorited ? '已收藏' : '收藏' }}
            </button>
            <button
              class="primary-action"
              type="button"
              :disabled="downloadStore.downloading"
              @click="downloadImage"
            >
              <ElIcon><Download /></ElIcon>
              {{ downloadStore.downloading ? '准备中...' : '免费下载' }}
            </button>
          </div>
        </aside>
      </div>

      <div v-else class="missing-state">
        <TaolingMascot state="empty" autoplay size="md" />
        <h1>这张图片暂时不在小岛上</h1>
        <p>它可能还未公开、已被删除，或链接发生了变化。</p>
        <button type="button" @click="goGallery">返回图库</button>
      </div>

      <section v-if="detailImage" class="related-section">
        <div class="section-heading">
          <h2>探索更多灵感</h2>
          <button type="button" @click="goGallery">查看全部</button>
        </div>

        <div v-if="imageStore.related.length" class="related-grid">
          <ImageCard
            v-for="image in imageStore.related"
            :key="image.id"
            :image="image"
            @view="openRelated"
          />
        </div>
        <div v-else class="related-empty">
          <TaolingMascot state="sleepy" autoplay size="sm" />
          <span>暂无相关推荐，桃灵还在整理更多灵感。</span>
        </div>
      </section>
    </div>
  </section>

  <ConfirmDialog
    v-model="loginVisible"
    title="登录后继续操作"
    description="收藏和下载图片需要登录桃灵图库账号，去登录吧。"
    confirm-text="前往登录"
    cancel-text="我先逛逛"
    @confirm="goLogin"
    @cancel="loginVisible = false"
  />
</template>

<style scoped lang="scss">
.detail-view {
  position: relative;
  min-height: calc(100vh - 112px);
  overflow: hidden;
  padding: 150px clamp(24px, 7vw, 108px) 92px;
  background:
    radial-gradient(circle at 12% 3%, rgba(255, 151, 188, 0.16), transparent 32%),
    linear-gradient(180deg, #fff9fb 0%, #fff5f8 100%);
}

.detail-glow {
  position: absolute;
  width: 42vw;
  max-width: 540px;
  aspect-ratio: 1;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(20px);
}

.detail-glow--top {
  top: -24%;
  left: -8%;
  background: radial-gradient(circle, rgba(255, 139, 181, 0.2), transparent 70%);
}

.detail-glow--bottom {
  right: -14%;
  bottom: 12%;
  background: radial-gradient(circle, rgba(197, 182, 255, 0.18), transparent 70%);
}

.detail-wrap {
  position: relative;
  z-index: 1;
  max-width: 1250px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 34px;
  padding: 0;
  margin-bottom: 28px;
  color: $color-text-secondary;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:hover {
    color: $color-primary;
  }
}

.detail-grid,
.detail-skeleton {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: clamp(28px, 4vw, 54px);
  align-items: start;
}

.image-stage {
  display: grid;
  min-height: 620px;
  overflow: hidden;
  place-items: center;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 36px;
  box-shadow: 0 24px 60px rgba(161, 72, 120, 0.1);

  img {
    width: 100%;
    height: 100%;
    max-height: 760px;
    object-fit: contain;
  }
}

.image-missing {
  display: grid;
  place-items: center;
}

.info-card {
  padding: 32px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 34px;
  box-shadow: 0 24px 60px rgba(161, 72, 120, 0.1);
  backdrop-filter: blur(18px);
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

h1 {
  margin: 14px 0 0;
  color: $color-text-main;
  font-size: clamp(30px, 3.2vw, 42px);
  font-weight: 600;
  line-height: 1.22;
  letter-spacing: 0;
}

.publish-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 22px 0;
  border-bottom: 1px solid rgba(161, 72, 120, 0.12);

  strong,
  span {
    display: block;
  }

  strong {
    color: $color-text-main;
  }

  span {
    margin-top: 4px;
    color: $color-text-light;
    font-size: 13px;
  }
}

.publish-mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  color: $color-primary;
  background: #ffe5ee;
  border-radius: 50%;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 20px 0 24px;

  span {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 8px;
    align-items: center;
    min-height: 58px;
    padding: 10px 12px;
    color: $color-text-secondary;
    background: rgba(255, 241, 247, 0.62);
    border: 1px solid rgba(244, 139, 181, 0.12);
    border-radius: 18px;
  }

  .el-icon {
    grid-row: 1 / span 2;
    color: $color-primary;
    font-size: 18px;
  }

  small {
    color: $color-text-light;
    font-size: 12px;
    line-height: 1;
  }

  strong {
    overflow: hidden;
    color: $color-text-main;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.description-block {
  h2 {
    margin: 0 0 12px;
    color: $color-text-main;
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: $color-text-secondary;
    line-height: 1.9;
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;

  span {
    min-height: 30px;
    padding: 5px 12px;
    color: $color-primary;
    background: #ffe9f0;
    border-radius: $radius-pill;
  }
}

.action-row {
  display: grid;
  grid-template-columns: 0.9fr 1.4fr;
  gap: 14px;
  margin-top: 34px;
}

.primary-action,
.secondary-action,
.missing-state button {
  min-height: 52px;
  cursor: pointer;
  border-radius: $radius-pill;
}

.primary-action {
  @include peach-button;

  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.secondary-action {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: $color-primary;
  background: rgba(255, 235, 242, 0.92);
  border: 0;
}

.detail-skeleton {
  div,
  aside {
    min-height: 520px;
    background: linear-gradient(
      90deg,
      rgba(255, 240, 247, 0.4),
      rgba(255, 255, 255, 0.72),
      rgba(255, 240, 247, 0.4)
    );
    background-size: 220% 100%;
    border-radius: 34px;
    animation: shimmer 1.4s ease-in-out infinite;
  }
}

.missing-state,
.related-empty {
  display: grid;
  justify-items: center;
  padding: 48px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.62);
  border-radius: 34px;
  box-shadow: 0 24px 60px rgba(161, 72, 120, 0.08);

  p,
  span {
    color: $color-text-secondary;
  }

  button {
    @include peach-button;

    min-width: 138px;
    margin-top: 22px;
  }
}

.related-section {
  padding-top: 44px;
  margin-top: 52px;
  border-top: 1px solid rgba(161, 72, 120, 0.12);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;

  h2 {
    margin: 0;
    color: $color-text-main;
    font-size: 28px;
    font-weight: 600;
  }

  button {
    color: $color-primary;
    cursor: pointer;
    background: transparent;
    border: 0;
  }
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

@keyframes shimmer {
  to {
    background-position: -220% 0;
  }
}

@media (max-width: 980px) {
  .detail-view {
    padding: 42px 18px 72px;
  }

  .detail-grid,
  .detail-skeleton {
    grid-template-columns: 1fr;
  }

  .image-stage {
    min-height: 360px;
  }

  .related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .info-card {
    padding: 24px;
  }

  .action-row,
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>
