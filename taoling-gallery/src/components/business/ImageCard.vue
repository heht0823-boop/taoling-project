<script setup lang="ts">
import { computed, ref } from 'vue'

import AppIcon from '@/components/icons/AppIcon.vue'
import type { GalleryImage } from '@/types/image'
import {
  formatCount,
  getAspectRatioSize,
  resolveImageThumbnailSrcset,
  resolveImageThumbnailUrl,
  resolveResponsiveImageUrl,
} from '@/utils/image'

const props = defineProps<{
  image: GalleryImage
  eager?: boolean
}>()

const emit = defineEmits<{
  view: [image: GalleryImage]
}>()

const imageFailed = ref(false)
const useOriginalImage = ref(false)

const imageSrc = computed(() => {
  if (useOriginalImage.value) {
    return resolveResponsiveImageUrl(props.image.thumbnail_url || props.image.image_url, {
      width: 420,
      quality: 78,
      format: 'webp',
    })
  }

  return resolveImageThumbnailUrl(props.image, {
    width: props.eager ? 420 : 320,
    quality: 72,
    format: 'webp',
  })
})
const imageSrcset = computed(() =>
  useOriginalImage.value
    ? undefined
    : resolveImageThumbnailSrcset(props.image, [320, 420, 520], {
        quality: 72,
        format: 'webp',
      }),
)
const imageSizes = '(max-width: 560px) calc(100vw - 36px), (max-width: 880px) calc((100vw - 64px) / 2), (max-width: 1080px) calc((100vw - 120px) / 3), 296px'

const visibleTags = computed(() => props.image.tags?.slice(0, 2) || [])
const categoryName = computed(() => props.image.category?.name || '未分类')
const displayAspectRatio = computed(() => props.image.aspect_ratio || '1:1')
const intrinsicSize = computed(() => getAspectRatioSize(props.image.aspect_ratio))

function handleImageError() {
  if (!useOriginalImage.value && (props.image.thumbnail_url || props.image.image_url)) {
    useOriginalImage.value = true
    return
  }

  imageFailed.value = true
}
</script>

<template>
  <article class="image-card" @click="emit('view', image)">
    <div class="image-frame">
      <img
        v-if="imageSrc && !imageFailed"
        :src="imageSrc"
        :srcset="imageSrcset"
        :sizes="imageSizes"
        :alt="image.title"
        :width="intrinsicSize.width"
        :height="intrinsicSize.height"
        :loading="eager ? 'eager' : 'lazy'"
        :fetchpriority="eager ? 'high' : 'auto'"
        decoding="async"
        @error="handleImageError"
      />
      <div v-else class="image-fallback">
        <span>桃灵正在整理这张图</span>
      </div>
    </div>

    <div class="image-info">
      <div class="top-row">
        <h2>{{ image.title || '未命名灵感图' }}</h2>
        <span class="ratio-badge">{{ displayAspectRatio }}</span>
      </div>

      <div class="meta-row">
        <div class="tag-list">
          <span class="tag-chip tag-chip--category">{{ categoryName }}</span>
          <span
            v-for="tag in visibleTags"
            :key="tag.id"
            class="tag-chip"
            :style="{ '--tag-color': tag.color || '#bfe9ff' }"
          >
            {{ tag.name }}
          </span>
        </div>

        <div class="count-list">
          <span class="icon-stat" aria-label="收藏数量">
            <AppIcon name="star" class="stat-icon" />
            {{ formatCount(image.favorite_count) }}
          </span>
          <span class="icon-stat" aria-label="下载数量">
            <AppIcon name="download" class="stat-icon" />
            {{ formatCount(image.download_count) }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.image-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 28px;
  box-shadow: 0 18px 44px rgba(161, 72, 120, 0.1);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 26px 54px rgba(161, 72, 120, 0.14);
  }
}

.image-frame {
  position: relative;
  flex: 0 0 auto;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: linear-gradient(135deg, #fff0f6 0%, #f0edff 100%);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.28s ease;
  }

  .image-card:hover & img {
    transform: scale(1.035);
  }
}

.image-fallback {
  display: grid;
  height: 100%;
  place-items: center;
  padding: 24px;
  color: $color-text-light;
  text-align: center;
  background:
    radial-gradient(circle at 38% 24%, rgba(255, 214, 229, 0.72), transparent 34%),
    linear-gradient(135deg, #fff2f7 0%, #f2f8ff 100%);
}

.image-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 122px;
  padding: 18px 18px 20px;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;

  h2 {
    margin: 0;
    overflow: hidden;
    color: $color-text-main;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.ratio-badge {
  flex: 0 0 auto;
  min-width: 42px;
  padding: 3px 9px;
  color: $color-text-secondary;
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
  background: rgba(255, 241, 247, 0.82);
  border: 1px solid rgba(244, 139, 181, 0.14);
  border-radius: $radius-pill;
  white-space: nowrap;
}

.meta-row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 14px;
}

.tag-list,
.count-list {
  display: flex;
  gap: 7px;
  align-items: center;
  min-width: 0;
}

.tag-list {
  overflow: hidden;
}

.tag-chip {
  flex: 0 0 auto;
  max-width: 84px;
  padding: 3px 9px;
  overflow: hidden;
  color: #704164;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: color-mix(in srgb, var(--tag-color) 30%, white);
  border: 1px solid rgba(112, 65, 100, 0.1);
  border-radius: $radius-pill;
}

.tag-chip--category {
  color: #88445f;
  background: #ffe5ee;
}

.count-list {
  flex: 0 0 auto;
}

.icon-stat {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 0;
  color: $color-text-light;
  font-size: 12px;
  cursor: default;
  background: transparent;
  border: 0;
}

.stat-icon {
  width: 1em;
  height: 1em;
}

@media (max-width: 540px) {
  .top-row h2 {
    font-size: 18px;
  }

  .meta-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
