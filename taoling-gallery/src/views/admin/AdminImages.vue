<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Edit, RefreshLeft, RefreshRight, Search, View } from '@element-plus/icons-vue'

import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import TaolingMascot from '@/components/business/TaolingMascot.vue'
import { useAdminStore } from '@/stores/admin'
import type { AdminImage, AdminImageStatus } from '@/types/admin'
import { formatCount, getAspectRatioSize, resolveImageUrl } from '@/utils/image'

const adminStore = useAdminStore()
const deleteVisible = ref(false)
const saveVisible = ref(false)
const pendingImage = ref<AdminImage | null>(null)
const pendingSaveImage = ref<AdminImage | null>(null)

const filters = reactive({
  keyword: '',
  category_id: undefined as number | undefined,
  status: '' as AdminImageStatus | '',
  page: 1,
  pageSize: 9,
})

const statusText: Record<AdminImageStatus, string> = {
  public: '公开',
  private: '私密',
  draft: '草稿',
  deleted: '已删除',
}
const coverSize = getAspectRatioSize('4:3', 420)

const totalPages = computed(
  () => Math.ceil(adminStore.imagePagination.total / filters.pageSize) || 1,
)

onMounted(async () => {
  await Promise.all([adminStore.fetchCategories(), fetchImages()])
})

async function fetchImages(options: { force?: boolean } = {}) {
  await adminStore.fetchImages(
    {
      ...filters,
      category_id: filters.category_id,
      status: filters.status,
      sort: 'latest',
    },
    options,
  )
  filters.page = adminStore.imagePagination.page
}

function resetFilters() {
  filters.keyword = ''
  filters.category_id = undefined
  filters.status = ''
  filters.page = 1
  fetchImages({ force: true })
}

function refreshImages() {
  fetchImages({ force: true })
}

function applyFilters() {
  filters.page = 1
  fetchImages({ force: true })
}

function openSaveConfirm(image: AdminImage) {
  pendingSaveImage.value = image
  saveVisible.value = true
}

async function confirmSave() {
  if (!pendingSaveImage.value) return
  const image = pendingSaveImage.value
  await adminStore.updateImage(image.id, {
    title: image.title.trim(),
    description: image.description?.trim() || undefined,
    display_weight: image.display_weight ?? 0,
    category_id: image.category?.id,
    tag_ids: image.tags?.map((tag) => tag.id),
  })
  saveVisible.value = false
  ElMessage.success('图片信息已更新')
}

async function changeStatus(image: AdminImage, status: AdminImageStatus) {
  await adminStore.updateImageStatus(image.id, status)
  ElMessage.success(`状态已切换为${statusText[status]}`)
}

function openDelete(image: AdminImage) {
  pendingImage.value = image
  deleteVisible.value = true
}

async function confirmDelete() {
  if (!pendingImage.value) return
  await adminStore.deleteImage(pendingImage.value.id)
  deleteVisible.value = false
  ElMessage.success('图片已移入删除状态')
}

async function restoreImage(image: AdminImage) {
  await adminStore.restoreImage(image.id)
  ElMessage.success('图片已恢复为草稿')
}

function prevPage() {
  filters.page--
  fetchImages({ force: true })
}

function nextPage() {
  filters.page++
  fetchImages({ force: true })
}
</script>

<template>
  <div class="images-page">
    <section class="toolbar-card">
      <div class="search-box">
        <ElIcon><Search /></ElIcon>
        <input
          v-model="filters.keyword"
          placeholder="搜索标题、描述或标签..."
          @keyup.enter="applyFilters"
        />
      </div>
      <select v-model="filters.category_id" @change="applyFilters">
        <option :value="undefined">所有分类</option>
        <option v-for="category in adminStore.categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
      <select v-model="filters.status" @change="applyFilters">
        <option value="">所有状态</option>
        <option value="public">公开</option>
        <option value="private">私密</option>
        <option value="draft">草稿</option>
        <option value="deleted">已删除</option>
      </select>
      <button type="button" @click="applyFilters">筛选</button>
      <button class="ghost" type="button" @click="resetFilters">重置</button>
      <button class="ghost" type="button" @click="refreshImages">
        <ElIcon><RefreshRight /></ElIcon>
        刷新
      </button>
    </section>

    <section v-if="adminStore.loading && !adminStore.images.length" class="empty-card">
      正在加载图片列表...
    </section>
    <section v-else-if="!adminStore.images.length" class="empty-card">
      <TaolingMascot state="empty" size="sm" />
      <p>当前筛选下没有图片，换个关键词或先上传新的灵感作品吧。</p>
    </section>

    <section v-else class="image-grid">
      <article v-for="image in adminStore.images" :key="image.id" class="image-card">
        <div class="cover">
          <img
            :src="resolveImageUrl(image.thumbnail_url || image.image_url)"
            :alt="image.title"
            :width="coverSize.width"
            :height="coverSize.height"
            loading="lazy"
            decoding="async"
          />
          <span :class="`status status-${image.status}`">{{ statusText[image.status] }}</span>
        </div>
        <div class="card-body">
          <input v-model="image.title" class="title-input" maxlength="80" />
          <textarea v-model="image.description" maxlength="320" placeholder="图片描述" />
          <div class="meta-row">
            <span
              ><ElIcon><View /></ElIcon>{{ formatCount(image.view_count || 0) }}</span
            >
            <span>下载 {{ formatCount(image.download_count || 0) }}</span>
            <label
              >权重 <input v-model.number="image.display_weight" type="number" min="0" max="100"
            /></label>
          </div>
          <div class="tag-row">
            <span v-for="tag in image.tags" :key="tag.id">{{ tag.name }}</span>
          </div>
          <div class="actions">
            <select
              :value="image.status"
              @change="
                changeStatus(image, ($event.target as HTMLSelectElement).value as AdminImageStatus)
              "
            >
              <option value="public">公开</option>
              <option value="private">私密</option>
              <option value="draft">草稿</option>
              <option value="deleted">已删除</option>
            </select>
            <button type="button" @click="openSaveConfirm(image)">
              <ElIcon><Edit /></ElIcon>
              保存
            </button>
            <button
              v-if="image.status === 'deleted'"
              class="ghost"
              type="button"
              @click="restoreImage(image)"
            >
              <ElIcon><RefreshLeft /></ElIcon>
              恢复
            </button>
            <button v-else class="danger" type="button" @click="openDelete(image)">
              <ElIcon><Delete /></ElIcon>
              删除
            </button>
          </div>
        </div>
      </article>
    </section>

    <div v-if="adminStore.imagePagination.total > filters.pageSize" class="pager">
      <button :disabled="filters.page <= 1" @click="prevPage">上一页</button>
      <span>{{ filters.page }} / {{ totalPages }}</span>
      <button :disabled="filters.page >= totalPages" @click="nextPage">下一页</button>
    </div>

    <ConfirmDialog
      v-model="saveVisible"
      title="确认保存图片信息吗？"
      description="图片的标题、描述、权重等信息将被更新。"
      confirm-text="保存"
      @confirm="confirmSave"
    />

    <ConfirmDialog
      v-model="deleteVisible"
      danger
      title="确认删除这张图片吗？"
      :description="`图片「${pendingImage?.title || ''}」会进入删除状态，可在已删除筛选中恢复。`"
      confirm-text="删除"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped lang="scss">
.images-page {
  display: grid;
  gap: 24px;
}

.toolbar-card,
.empty-card,
.image-card {
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 28px;
  box-shadow: $shadow-soft;
  backdrop-filter: blur(18px);
}

.toolbar-card {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) 170px 150px auto auto auto;
  gap: 14px;
  align-items: center;
  padding: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(161, 72, 120, 0.18);
  border-radius: $radius-pill;
}

input,
textarea,
select {
  min-height: 44px;
  color: $color-text-main;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(161, 72, 120, 0.18);
  border-radius: 18px;
  outline: none;
}

.search-box input {
  flex: 1;
  border: 0;
  background: transparent;
}

button {
  min-height: 42px;
  padding: 0 18px;
  color: $color-text-white;
  cursor: pointer;
  background: $gradient-primary;
  border: 0;
  border-radius: $radius-pill;
}

.ghost {
  color: $color-primary;
  background: rgba(255, 241, 246, 0.9);
}

.danger {
  color: #c64357;
  background: rgba(255, 226, 233, 0.9);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.image-card {
  overflow: hidden;
}

.cover {
  position: relative;
  aspect-ratio: 1.42;
  overflow: hidden;
  background: $gradient-card-blue;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.status {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 6px 12px;
  color: $color-primary;
  background: rgba(255, 255, 255, 0.86);
  border-radius: $radius-pill;
}

.status-public {
  color: #2f9e67;
}

.status-deleted {
  color: #d55a49;
}

.card-body {
  display: grid;
  gap: 12px;
  padding: 18px;
}

.title-input {
  padding: 0 12px;
  font-size: 18px;
  font-weight: 600;
}

textarea {
  min-height: 72px;
  padding: 12px;
  resize: vertical;
}

.meta-row,
.actions,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.meta-row {
  color: $color-text-light;
  font-size: 13px;

  label {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  input {
    width: 74px;
    min-height: 34px;
    padding: 0 10px;
  }
}

.tag-row span {
  padding: 5px 10px;
  color: $color-primary;
  background: rgba(255, 214, 229, 0.48);
  border-radius: $radius-pill;
}

.actions {
  select {
    flex: 1;
    min-width: 110px;
    padding: 0 12px;
  }

  button {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }
}

.empty-card {
  display: grid;
  gap: 12px;
  min-height: 320px;
  place-items: center;
  padding: 38px;
  color: $color-text-light;
  text-align: center;
}

.pager {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;

  button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

@media (max-width: 1120px) {
  .toolbar-card,
  .image-grid {
    grid-template-columns: 1fr;
  }
}
</style>
