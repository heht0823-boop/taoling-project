<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Close, Picture, Search, UploadFilled } from '@element-plus/icons-vue'

import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import TaolingMascot from '@/components/business/TaolingMascot.vue'
import { useAdminStore } from '@/stores/admin'
import { debounce } from '@/utils/perform'
import type { AdminImageStatus } from '@/types/admin'
import { convertImageToWebp } from '@/utils/imageConvert'

const adminStore = useAdminStore()
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const webpFile = ref<File | null>(null)
const converting = ref(false)
const dragActive = ref(false)
const saveVisible = ref(false)
const pendingStatus = ref<AdminImageStatus>('public')

const ASPECT_RATIO_OPTIONS = [
  { value: '9:16', label: '9:16 — 手机竖屏' },
  { value: '3:4', label: '3:4 — 经典竖版' },
  { value: '1:1', label: '1:1 — 方形' },
  { value: '4:3', label: '4:3 — 横版照片' },
  { value: '16:9', label: '16:9 — 宽屏' },
]

function closestAspectRatio(detected: string): string {
  const [w, h] = detected.split(':').map(Number)
  if (!w || !h) return '3:4'
  const ratio = w / h
  let closest = ASPECT_RATIO_OPTIONS[2]?.value || '1:1'
  let minDiff = Infinity
  for (const opt of ASPECT_RATIO_OPTIONS) {
    const [ow, oh] = opt.value.split(':').map(Number)
    if (!ow || !oh) continue
    const diff = Math.abs(ratio - ow / oh)
    if (diff < minDiff) {
      minDiff = diff
      closest = opt.value
    }
  }
  return closest
}

const form = reactive({
  title: '',
  description: '',
  category_id: undefined as number | undefined,
  tag_ids: [] as number[],
  status: 'public' as AdminImageStatus,
  display_weight: 50,
  aspect_ratio: '3:4',
})

const isBusy = computed(() => converting.value || adminStore.uploading || adminStore.loading)

// 标签选择器状态
const tagKeyword = ref('')
const tagPage = ref(1)
const tagTotal = ref(0)
const tagTotalPages = ref(1)
const tagPageSize = 12
const TAG_MAX = 5
const previewSize = {
  width: 480,
  height: 480,
}

const selectedTags = computed(() => adminStore.tags.filter((t) => form.tag_ids.includes(t.id)))

const tagSearchLoading = ref(false)

const debouncedSearchTags = debounce(async (keyword: string) => {
  tagPage.value = 1
  tagSearchLoading.value = true
  try {
    const result = await adminStore.fetchTags({
      keyword: keyword || undefined,
      page: 1,
      pageSize: tagPageSize,
      status: 'normal',
    })
    tagTotal.value = result.pagination.total
    tagTotalPages.value = result.pagination.totalPages || 1
  } finally {
    tagSearchLoading.value = false
  }
}, 400)

async function fetchTagPage(page: number) {
  tagPage.value = page
  tagSearchLoading.value = true
  try {
    const result = await adminStore.fetchTags({
      keyword: tagKeyword.value || undefined,
      page,
      pageSize: tagPageSize,
      status: 'normal',
    })
    tagTotal.value = result.pagination.total
    tagTotalPages.value = result.pagination.totalPages || 1
  } finally {
    tagSearchLoading.value = false
  }
}

function toggleTag(tagId: number) {
  const idx = form.tag_ids.indexOf(tagId)
  if (idx >= 0) {
    form.tag_ids.splice(idx, 1)
  } else {
    if (form.tag_ids.length >= TAG_MAX) {
      ElMessage.warning(`最多选择 ${TAG_MAX} 个标签`)
      return
    }
    form.tag_ids.push(tagId)
  }
}

function removeTag(tagId: number) {
  const idx = form.tag_ids.indexOf(tagId)
  if (idx >= 0) form.tag_ids.splice(idx, 1)
}

onMounted(() => {
  adminStore.fetchCategories()
  void fetchTagPage(1)
})

function openPicker() {
  fileInput.value?.click()
}

async function handleFile(file?: File) {
  if (!file) return

  converting.value = true
  try {
    const result = await convertImageToWebp(file, {
      quality: 0.86,
      maxWidth: 2400,
      maxHeight: 2400,
    })
    webpFile.value = result.file
    form.aspect_ratio = closestAspectRatio(result.aspectRatio)
    form.title ||= file.name.replace(/\.[^.]+$/, '')
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(result.file)
    ElMessage.success('图片已转换为 WebP，桃灵准备好收录啦')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '图片处理失败')
  } finally {
    converting.value = false
  }
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  handleFile(target.files?.[0])
  target.value = ''
}

function onDrop(event: DragEvent) {
  dragActive.value = false
  handleFile(event.dataTransfer?.files?.[0])
}

async function submit(status: AdminImageStatus) {
  if (!webpFile.value) {
    ElMessage.warning('请先选择一张图片')
    return
  }

  if (!form.title.trim()) {
    ElMessage.warning('请填写图片标题')
    return
  }

  pendingStatus.value = status
  saveVisible.value = true
}

async function confirmSave() {
  const status = pendingStatus.value
  const uploaded = await adminStore.uploadImageFile(webpFile.value!)
  await adminStore.createImage({
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    image_url: uploaded.image_url,
    thumbnail_url: uploaded.thumbnail_url || uploaded.image_url,
    category_id: form.category_id,
    tag_ids: form.tag_ids,
    status,
    display_weight: form.display_weight,
    aspect_ratio: form.aspect_ratio,
  })
  ElMessage.success(status === 'draft' ? '草稿已保存' : '图片已发布到图库')
  saveVisible.value = false
  resetForm()
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.category_id = undefined
  form.tag_ids = []
  form.status = 'public'
  form.display_weight = 50
  form.aspect_ratio = '3:4'
  webpFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}
</script>

<template>
  <div class="upload-page">
    <section class="drop-card">
      <div
        class="drop-zone"
        :class="{ 'is-active': dragActive }"
        @click="openPicker"
        @dragenter.prevent="dragActive = true"
        @dragover.prevent="dragActive = true"
        @dragleave.prevent="dragActive = false"
        @drop.prevent="onDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          @change="onFileChange"
        />
        <ElIcon><UploadFilled /></ElIcon>
        <h2>{{ converting ? '正在转换 WebP...' : '点击或拖拽图片到这里' }}</h2>
        <p>支持 JPG、PNG、WEBP，前端会自动压缩转换为 WebP 后再上传。</p>
      </div>

      <div class="preview-card">
        <h3>上传预览</h3>
        <div class="preview-box">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="上传预览"
            :width="previewSize.width"
            :height="previewSize.height"
            decoding="async"
          />
          <div v-else>
            <ElIcon><Picture /></ElIcon>
            <span>等待上传</span>
          </div>
        </div>
        <p v-if="webpFile">
          {{ webpFile.name }} · {{ (webpFile.size / 1024 / 1024).toFixed(2) }}MB
        </p>
      </div>
    </section>

    <section class="form-card">
      <div class="form-title">
        <h2>图片详情设置</h2>
        <TaolingMascot state="success" size="sm" />
      </div>

      <label>
        图片标题
        <input v-model="form.title" maxlength="80" placeholder="例如：梦幻水彩抽象背景" />
      </label>
      <label>
        图片描述
        <textarea
          v-model="form.description"
          maxlength="800"
          placeholder="输入生成提示词、用途或风格说明..."
        />
      </label>

      <div class="form-row">
        <label>
          所属分类
          <select v-model="form.category_id">
            <option :value="undefined">选择分类</option>
            <option
              v-for="category in adminStore.categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </label>
        <label>
          展示权重
          <input v-model.number="form.display_weight" min="0" max="100" type="number" />
        </label>
      </div>

      <div class="tag-picker">
        <span class="picker-label">标签（最多 5 个）</span>

        <div class="selected-tags">
          <span
            v-for="tag in selectedTags"
            :key="tag.id"
            class="selected-tag"
            :style="{ '--tag-color': tag.color || '#ffd6e5' }"
          >
            {{ tag.name }}
            <button type="button" class="tag-remove" @click="removeTag(tag.id)">
              <ElIcon><Close /></ElIcon>
            </button>
          </span>
          <span v-if="!selectedTags.length" class="placeholder">尚未选择标签</span>
        </div>

        <div class="tag-search-box">
          <ElIcon><Search /></ElIcon>
          <input
            v-model="tagKeyword"
            placeholder="搜索标签..."
            @input="debouncedSearchTags(tagKeyword)"
          />
        </div>

        <div v-if="tagSearchLoading" class="tag-loading">正在搜索...</div>

        <div v-else-if="adminStore.tags.length" class="tag-options">
          <button
            v-for="tag in adminStore.tags"
            :key="tag.id"
            type="button"
            class="tag-btn"
            :class="{ 'is-selected': form.tag_ids.includes(tag.id) }"
            :style="{
              '--tag-color': tag.color || '#ffd6e5',
              '--tag-color-light': (tag.color || '#ffd6e5') + '33',
            }"
            :disabled="!form.tag_ids.includes(tag.id) && form.tag_ids.length >= TAG_MAX"
            @click="toggleTag(tag.id)"
          >
            {{ tag.name }}
          </button>
        </div>

        <div v-else class="tag-empty">没有匹配的标签</div>

        <div v-if="tagTotalPages > 1" class="tag-pager">
          <button type="button" :disabled="tagPage <= 1" @click="fetchTagPage(tagPage - 1)">
            上一页
          </button>
          <span>{{ tagPage }} / {{ tagTotalPages }}</span>
          <button
            type="button"
            :disabled="tagPage >= tagTotalPages"
            @click="fetchTagPage(tagPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>

      <label>
        图片比例
        <select v-model="form.aspect_ratio">
          <option v-for="opt in ASPECT_RATIO_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>

      <div class="status-area">
        <label><input v-model="form.status" type="radio" value="public" /> 公开</label>
        <label><input v-model="form.status" type="radio" value="private" /> 私密</label>
        <label><input v-model="form.status" type="radio" value="draft" /> 草稿</label>
      </div>

      <div class="actions">
        <button type="button" :disabled="isBusy" @click="submit(form.status)">
          <ElIcon><Check /></ElIcon>
          {{ isBusy ? '处理中...' : '立即保存' }}
        </button>
        <button class="ghost" type="button" :disabled="isBusy" @click="submit('draft')">
          保存草稿
        </button>
      </div>
    </section>
  </div>

  <ConfirmDialog
    v-model="saveVisible"
    title="确认发布图片吗？"
    :description="
      pendingStatus === 'draft' ? '图片将以草稿状态保存，暂不公开。' : '图片将发布到图库公开显示。'
    "
    :confirm-text="pendingStatus === 'draft' ? '保存草稿' : '发布图片'"
    @confirm="confirmSave"
  />
</template>

<style scoped lang="scss">
.upload-page {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.85fr);
  gap: 24px;
}

.drop-card,
.form-card,
.preview-card {
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 30px;
  box-shadow: $shadow-soft;
  backdrop-filter: blur(18px);
}

.drop-card {
  display: grid;
  gap: 20px;
  padding: 24px;
}

.drop-zone {
  display: grid;
  min-height: 330px;
  place-items: center;
  padding: 34px;
  text-align: center;
  cursor: pointer;
  border: 2px dashed rgba(161, 72, 120, 0.22);
  border-radius: 28px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  &.is-active {
    background: rgba(255, 214, 229, 0.26);
    border-color: $color-primary-light;
  }

  .el-icon {
    display: grid;
    width: 78px;
    height: 78px;
    place-items: center;
    color: $color-primary;
    font-size: 34px;
    background: rgba(255, 214, 229, 0.72);
    border-radius: 50%;
  }

  h2 {
    margin: 18px 0 8px;
    color: $color-text-main;
  }

  p {
    margin: 0;
    color: $color-text-secondary;
  }
}

.preview-card {
  padding: 22px;

  h3 {
    margin: 0 0 16px;
    color: $color-text-main;
  }

  p {
    color: $color-text-light;
  }
}

.preview-box {
  display: grid;
  min-height: 220px;
  overflow: hidden;
  place-items: center;
  background: $gradient-card-blue;
  border-radius: 24px;

  img {
    width: 100%;
    height: 100%;
    max-height: 360px;
    object-fit: contain;
  }

  div {
    display: grid;
    gap: 10px;
    place-items: center;
    color: $color-text-light;
  }
}

.form-card {
  display: grid;
  gap: 18px;
  padding: 28px;
}

.form-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    color: $color-primary;
    font-size: 24px;
  }
}

label {
  display: grid;
  gap: 8px;
  color: $color-text-main;
}

input,
textarea,
select {
  width: 100%;
  padding: 0 18px;
  color: $color-text-main;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(161, 72, 120, 0.2);
  border-radius: 20px;
  outline: none;
}

input,
select {
  height: 48px;
}

/* ── 标签选择器 ── */
.tag-picker {
  display: grid;
  gap: 10px;
}

.picker-label {
  color: $color-text-main;
  font-size: 14px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(161, 72, 120, 0.2);
  border-radius: 20px;

  .placeholder {
    color: $color-text-light;
    font-size: 13px;
  }
}

.selected-tag {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 4px 10px;
  color: #fff;
  font-size: 13px;
  background: var(--tag-color, #ffd6e5);
  border-radius: $radius-pill;

  .tag-remove {
    display: inline-flex;
    align-items: center;
    padding: 0;
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    background: transparent;
    border: 0;
    font-size: 12px;

    &:hover {
      color: #fff;
    }
  }
}

.tag-search-box {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(161, 72, 120, 0.2);
  border-radius: 20px;

  .el-icon {
    color: $color-text-light;
  }

  input {
    flex: 1;
    height: 38px;
    padding: 0;
    background: transparent;
    border: 0;
    outline: none;
    color: $color-text-main;
  }
}

.tag-loading,
.tag-empty {
  padding: 12px 0;
  color: $color-text-light;
  font-size: 13px;
  text-align: center;
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px 0;
}

.tag-btn {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  color: var(--tag-color, $color-primary);
  cursor: pointer;
  background: var(--tag-color-light, rgba(255, 214, 229, 0.5));
  border: 1.5px solid transparent;
  border-radius: $radius-pill;
  font-size: 13px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--tag-color, $color-primary);
    transform: translateY(-1px);
  }

  &.is-selected {
    color: #fff;
    background: var(--tag-color, $color-primary);
    border-color: var(--tag-color, $color-primary);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.tag-pager {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    padding: 0 14px;
    color: $color-primary;
    cursor: pointer;
    background: rgba(255, 241, 246, 0.9);
    border: 0;
    border-radius: $radius-pill;
    font-size: 13px;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  }

  span {
    color: $color-text-light;
    font-size: 13px;
  }
}

textarea {
  min-height: 128px;
  padding-top: 14px;
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 140px;
  gap: 14px;
}

.status-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.status-area input {
  width: auto;
  height: auto;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(161, 72, 120, 0.12);

  button {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    color: $color-text-white;
    cursor: pointer;
    background: $gradient-primary;
    border: 0;
    border-radius: $radius-pill;
    box-shadow: $shadow-button;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.56;
    }
  }

  .ghost {
    color: $color-primary;
    background: rgba(255, 241, 246, 0.9);
    box-shadow: none;
  }
}

@media (max-width: 1080px) {
  .upload-page {
    grid-template-columns: 1fr;
  }
}
</style>
