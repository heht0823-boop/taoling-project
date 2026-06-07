<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/icons/AppIcon.vue'
import ImageCard from '@/components/business/ImageCard.vue'
import TaolingMascot from '@/components/business/TaolingMascot.vue'
import { useCategoryStore } from '@/stores/category'
import { useImageStore } from '@/stores/image'
import { useTagStore } from '@/stores/tag'
import { notifyError } from '@/utils/notify'
import { debounce, throttle } from '@/utils/perform'
import type { GalleryImage, ImageSort } from '@/types/image'

const router = useRouter()
const imageStore = useImageStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

const keyword = ref('')
const activeCategoryId = ref<number | undefined>()
const activeTagId = ref<number | undefined>()
const activeAspectRatio = ref('')
const activeSort = ref<ImageSort>('latest')
const pageReady = ref(false)
const loadMoreRef = ref<HTMLElement>()

const throttledScroll = throttle(() => {
  void checkLoadMore()
}, 300)
const debouncedSubmitSearch = debounce(() => {
  void submitSearch()
}, 420)

const loading = computed(() => imageStore.loading || categoryStore.loading || tagStore.loading)
const hotKeywords = computed(() => {
  const tagNames = tagStore.list.slice(0, 3).map((tag) => tag.name)
  return tagNames.length ? tagNames : ['二次元头像', '唯美壁纸', '机甲插画']
})

const categoryTabs = computed(() => [
  { id: undefined, name: '全部推荐' },
  ...categoryStore.list.map((item) => ({ id: item.id, name: item.name })),
])

const aspectOptions = [
  { label: '全部', value: '' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
]

async function loadGalleryData(options: { force?: boolean } = {}) {
  try {
    await Promise.all([
      categoryStore.fetchCategories(options),
      tagStore.fetchTags('', options),
      imageStore.fetchImages({
        page: 1,
        pageSize: 12,
        sort: activeSort.value,
      }, options),
    ])
  } catch {
    notifyError('图库数据加载失败，请稍后再试')
  } finally {
    pageReady.value = true
  }
}

function buildSearchParams() {
  return {
    keyword: keyword.value.trim() || undefined,
    category_id: activeCategoryId.value,
    tag_id: activeTagId.value,
    aspect_ratio: activeAspectRatio.value || undefined,
    sort: activeSort.value,
  }
}

async function submitSearch() {
  await imageStore.fetchImages(
    {
      ...buildSearchParams(),
      page: 1,
      pageSize: imageStore.query.pageSize || 12,
    },
    { force: true },
  )
}

async function checkLoadMore() {
  if (imageStore.loading || !imageStore.hasMore) return
  await imageStore.loadMoreImages()
}

let loadMoreObserver: IntersectionObserver | undefined

onMounted(() => {
  void loadGalleryData()

  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        throttledScroll()
      }
    },
    { rootMargin: '200px' },
  )

  if (loadMoreRef.value) {
    loadMoreObserver.observe(loadMoreRef.value)
  }
})

onUnmounted(() => {
  loadMoreObserver?.disconnect()
})

async function useHotKeyword(value: string) {
  keyword.value = value
  await submitSearch()
}

async function selectCategory(id?: number) {
  activeCategoryId.value = id
  await submitSearch()
}

async function changeTagFilter(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  activeTagId.value = value || undefined
  await submitSearch()
}

async function changeSort(sort: ImageSort) {
  activeSort.value = sort
  await imageStore.fetchImages({ ...buildSearchParams(), sort, page: 1 }, { force: true })
}

async function refreshGallery() {
  await loadGalleryData({ force: true })
}

function openImage(image: GalleryImage) {
  void router.push(`/images/${image.id}`)
}
</script>

<template>
  <section class="gallery-view">
    <div class="gallery-glow gallery-glow--top" />
    <div class="gallery-glow gallery-glow--bottom" />

    <section class="search-hero">
      <div class="search-copy">
        <span class="soft-label">Taoling Gallery Search</span>
        <h1>探索无限灵感</h1>
        <p>输入关键词，让桃灵为你寻找更契合的 AI 艺术作品。</p>

        <form class="search-box" @submit.prevent="submitSearch">
          <AppIcon name="search" class="search-icon" />
          <input
            v-model="keyword"
            type="search"
            placeholder="例如：桃粉水彩头像、梦幻云岛风景..."
            @input="debouncedSubmitSearch"
          />
          <button type="submit">搜索</button>
        </form>

        <div class="hot-row">
          <span>热门搜索：</span>
          <button
            v-for="item in hotKeywords"
            :key="item"
            type="button"
            @click="useHotKeyword(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <div class="search-mascot">
        <TaolingMascot state="search" autoplay priority size="md" />
        <span class="mascot-tag mascot-tag--one">#Wallpaper</span>
        <span class="mascot-tag mascot-tag--two">#Search</span>
        <span class="mascot-tag mascot-tag--three">#Cute</span>
      </div>
    </section>

    <section class="gallery-panel">
      <div class="category-row" aria-label="分类筛选">
        <button
          v-for="item in categoryTabs"
          :key="item.name"
          class="category-chip"
          :class="{ 'is-active': activeCategoryId === item.id }"
          type="button"
          @click="selectCategory(item.id)"
        >
          {{ item.name }}
        </button>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-title">
            <AppIcon name="filter" class="filter-icon" />
            筛选
          </span>

          <label class="select-shell">
            风格：
            <select :value="activeTagId || ''" @change="changeTagFilter">
              <option value="">全部</option>
              <option v-for="tag in tagStore.list" :key="tag.id" :value="tag.id">
                {{ tag.name }}
              </option>
            </select>
            <AppIcon name="arrow-down" class="select-icon" />
          </label>

          <label class="select-shell">
            比例：
            <select v-model="activeAspectRatio" @change="submitSearch">
              <option v-for="item in aspectOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <AppIcon name="arrow-down" class="select-icon" />
          </label>
        </div>

        <div class="sort-tabs">
          <span>排序：</span>
          <button
            type="button"
            :class="{ 'is-active': activeSort === 'latest' }"
            @click="changeSort('latest')"
          >
            最新
          </button>
          <button
            type="button"
            :class="{ 'is-active': activeSort === 'hot' }"
            @click="changeSort('hot')"
          >
            最热
          </button>
          <button class="refresh-button" type="button" :disabled="loading" @click="refreshGallery">
            <AppIcon name="refresh" class="refresh-icon" />
            刷新
          </button>
        </div>
      </div>

      <div v-if="loading && !pageReady" class="skeleton-grid">
        <div v-for="item in 4" :key="item" class="image-skeleton">
          <span />
          <em />
          <i />
        </div>
      </div>

      <div v-else-if="imageStore.hasImages" class="image-grid">
        <ImageCard
          v-for="(image, index) in imageStore.list"
          :key="image.id"
          :image="image"
          :eager="index === 0"
          @view="openImage"
        />
      </div>

      <div v-else class="empty-state">
        <TaolingMascot state="empty" autoplay size="sm" />
        <h2>这里暂时还没有公开图片</h2>
        <p>后端发布图片后，桃灵会立刻把它们整理到这里。你也可以换个关键词或筛选条件再试试。</p>
        <button type="button" @click="submitSearch">重新寻找</button>
      </div>

      <div ref="loadMoreRef" class="load-more">
        <span v-if="imageStore.loading" class="dot-loader">
          <i />
          <i />
          <i />
        </span>
        <span v-else-if="imageStore.hasMore">向下滚动加载更多灵感...</span>
        <span v-else>已经看完当前灵感啦</span>
      </div>
    </section>
  </section>
</template>

<style scoped lang="scss">
.gallery-view {
  position: relative;
  min-height: calc(100vh - 112px);
  overflow: hidden;
  padding: 150px clamp(24px, 7vw, 108px) 88px;
  background:
    radial-gradient(circle at 12% 3%, rgba(255, 151, 188, 0.18), transparent 32%),
    radial-gradient(circle at 84% 6%, rgba(197, 182, 255, 0.14), transparent 30%),
    linear-gradient(180deg, #fff9fb 0%, #fff4f8 100%);
}

.gallery-glow {
  position: absolute;
  width: 42vw;
  max-width: 540px;
  aspect-ratio: 1;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(20px);
}

.gallery-glow--top {
  top: -25%;
  left: -8%;
  background: radial-gradient(circle, rgba(255, 139, 181, 0.22), transparent 70%);
}

.gallery-glow--bottom {
  right: -12%;
  bottom: 20%;
  background: radial-gradient(circle, rgba(197, 182, 255, 0.2), transparent 70%);
}

.search-hero,
.gallery-panel {
  position: relative;
  z-index: 1;
  max-width: 1250px;
  margin: 0 auto;
}

.search-hero {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(260px, 340px);
  gap: clamp(28px, 5vw, 72px);
  align-items: center;
  min-height: 330px;
  padding: clamp(34px, 5vw, 58px) clamp(32px, 6vw, 70px);
  background: rgba(255, 242, 247, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 36px;
  box-shadow:
    0 24px 62px rgba(161, 72, 120, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px);
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
}

h1 {
  margin: 0;
  color: $color-primary;
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 600;
  letter-spacing: 0;
}

p {
  margin: 22px 0 0;
  color: $color-text-secondary;
  font-size: clamp(15px, 1.6vw, 18px);
  line-height: 1.8;
}

.search-box {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  max-width: 690px;
  min-height: 56px;
  margin-top: 30px;
  padding: 5px 5px 5px 18px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(161, 72, 120, 0.12);
  border-radius: $radius-pill;
  box-shadow: inset 0 2px 10px rgba(161, 72, 120, 0.06);

  .search-icon {
    width: 21px;
    height: 21px;
    color: #c17091;
  }

  input {
    width: 100%;
    min-width: 0;
    color: $color-text-main;
    font-size: 16px;
    background: transparent;
    border: 0;
    outline: none;
  }

  button {
    min-width: 92px;
    min-height: 46px;
    color: $color-text-white;
    cursor: pointer;
    background: linear-gradient(135deg, $color-primary 0%, $color-secondary 100%);
    border: 0;
    border-radius: $radius-pill;
    box-shadow: 0 12px 24px rgba(161, 72, 120, 0.18);
  }
}

.hot-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
  color: $color-text-secondary;
  font-size: 14px;

  button {
    min-height: 26px;
    padding: 0 12px;
    color: #1d6f9e;
    font-weight: 600;
    cursor: pointer;
    background: #e7f5ff;
    border: 0;
    border-radius: $radius-pill;

    &:nth-of-type(2) {
      color: $color-primary-dark;
      background: #ffe5ee;
    }

    &:nth-of-type(3) {
      color: #6750c8;
      background: #eee6ff;
    }
  }
}

.search-mascot {
  position: relative;
  display: grid;
  min-height: 250px;
  place-items: center;
  background: rgba(255, 255, 255, 0.64);
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 30px;
  box-shadow: 0 16px 36px rgba(161, 72, 120, 0.08);
}

.mascot-tag {
  position: absolute;
  min-height: 30px;
  padding: 6px 12px;
  color: $color-text-white;
  font-size: 13px;
  border-radius: $radius-pill;
  box-shadow: 0 10px 20px rgba(161, 72, 120, 0.12);
  animation: floatTag 4.2s ease-in-out infinite;
}

.mascot-tag--one {
  top: 34px;
  left: 22px;
  background: linear-gradient(135deg, #ffd28b 0%, #ff9dc2 100%);
}

.mascot-tag--two {
  right: 20px;
  top: 96px;
  background: linear-gradient(135deg, #97e2ff 0%, #b6a1ff 100%);
  animation-delay: 0.8s;
}

.mascot-tag--three {
  right: 28px;
  bottom: 42px;
  background: linear-gradient(135deg, #c5b6ff 0%, #8b6eea 100%);
  animation-delay: 1.3s;
}

.gallery-panel {
  margin-top: 42px;
}

.category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.category-chip {
  min-width: 104px;
  min-height: 40px;
  padding: 0 22px;
  color: $color-text-secondary;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(161, 72, 120, 0.12);
  border-radius: $radius-pill;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;

  &.is-active,
  &:hover {
    color: $color-text-white;
    background: $color-primary;
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(161, 72, 120, 0.16);
  }
}

.filter-bar {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  margin-top: 28px;
  padding: 0 14px 0 18px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(161, 72, 120, 0.08);
  border-radius: $radius-pill;
}

.filter-group,
.sort-tabs,
.filter-title,
.select-shell {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.filter-title {
  color: $color-primary;
}

.select-shell {
  color: $color-text-secondary;
  font-size: 14px;

  select {
    min-width: 72px;
    color: $color-text-main;
    cursor: pointer;
    appearance: none;
    background: transparent;
    border: 0;
    outline: none;
  }

  .select-icon {
    width: 12px;
    height: 12px;
    color: $color-text-light;
  }
}

.filter-icon,
.refresh-icon {
  width: 1em;
  height: 1em;
}

.sort-tabs {
  flex: 0 0 auto;
  color: $color-text-secondary;
  font-size: 14px;

  button {
    min-width: 54px;
    min-height: 30px;
    color: $color-text-secondary;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: $radius-pill;

    &.is-active {
      color: $color-primary-dark;
      background: rgba(255, 232, 240, 0.92);
      border: 1px solid rgba(244, 139, 181, 0.18);
    }
  }
}

.image-grid,
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(18px, 2vw, 28px);
  margin-top: 30px;
}

.image-skeleton {
  min-height: 360px;
  overflow: hidden;
  background: rgba(255, 235, 241, 0.7);
  border-radius: 28px;
  box-shadow: 0 18px 42px rgba(161, 72, 120, 0.08);

  span {
    display: block;
    height: 260px;
    background: linear-gradient(
      90deg,
      rgba(255, 240, 247, 0.4),
      rgba(255, 255, 255, 0.72),
      rgba(255, 240, 247, 0.4)
    );
    background-size: 220% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  em,
  i {
    display: block;
    height: 18px;
    margin: 18px;
    background: rgba(255, 255, 255, 0.68);
    border-radius: $radius-pill;
  }

  i {
    width: 58%;
    margin-top: 0;
  }
}

.empty-state {
  display: grid;
  justify-items: center;
  margin-top: 34px;
  padding: 46px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 32px;
  box-shadow: 0 18px 44px rgba(161, 72, 120, 0.08);

  h2 {
    margin: 18px 0 0;
    color: $color-text-main;
    font-size: 24px;
    font-weight: 600;
  }

  p {
    max-width: 560px;
    margin-top: 12px;
    font-size: 15px;
  }

  button {
    @include peach-button;

    min-width: 132px;
    min-height: 42px;
    margin-top: 22px;
    cursor: pointer;
  }
}

.load-more {
  display: grid;
  min-height: 76px;
  place-items: center;
  color: $color-text-light;
  font-size: 14px;
}

.dot-loader {
  display: inline-flex;
  gap: 8px;

  i {
    width: 8px;
    height: 8px;
    background: $color-primary-light;
    border-radius: 50%;
    animation: dotPulse 1.1s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.16s;
    }

    &:nth-child(3) {
      animation-delay: 0.32s;
    }
  }
}

@keyframes shimmer {
  to {
    background-position: -220% 0;
  }
}

@keyframes dotPulse {
  0%,
  100% {
    opacity: 0.36;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(-5px);
  }
}

@keyframes floatTag {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }

  50% {
    transform: translateY(-8px) rotate(2deg);
  }
}

@media (max-width: 1080px) {
  .image-grid,
  .skeleton-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 880px) {
  .gallery-view {
    padding: 42px 18px 72px;
  }

  .search-hero {
    grid-template-columns: 1fr;
    padding: 30px 22px;
    text-align: center;
  }

  .search-box {
    margin-right: auto;
    margin-left: auto;
  }

  .hot-row,
  .category-row,
  .filter-bar {
    justify-content: center;
  }

  .filter-bar {
    flex-direction: column;
    min-height: auto;
    padding: 16px;
    border-radius: 24px;
  }

  .filter-group {
    flex-wrap: wrap;
    justify-content: center;
  }

  .image-grid,
  .skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .search-box {
    grid-template-columns: auto 1fr;
    padding: 14px 16px;
    border-radius: 24px;

    button {
      grid-column: 1 / -1;
      width: 100%;
    }
  }

  .search-mascot {
    min-height: 220px;
  }

  .mascot-tag {
    display: none;
  }

  .category-chip {
    min-width: 0;
  }

  .image-grid,
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}
</style>
