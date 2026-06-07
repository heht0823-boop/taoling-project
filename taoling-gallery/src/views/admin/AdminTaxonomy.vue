<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Folder, Plus, PriceTag, RefreshRight } from '@element-plus/icons-vue'

import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const categoryForm = reactive({ name: '', sort_order: 100 })
const tagForm = reactive({ name: '', color: '#ffd6e5' })
const deleteVisible = ref(false)
const saveCategoryVisible = ref(false)
const saveTagVisible = ref(false)
const addCategoryVisible = ref(false)
const addTagVisible = ref(false)
const pendingSaveCategory = ref<{ id: number; name: string; sortOrder?: number } | null>(null)
const pendingSaveTag = ref<{ id: number; name: string; color?: string } | null>(null)
const pendingDelete = ref<{ type: 'category' | 'tag'; id: number; name: string } | null>(null)

onMounted(() => {
  adminStore.fetchCategories()
  adminStore.fetchTags()
})

function refreshTaxonomy() {
  adminStore.fetchCategories(undefined, { force: true })
  adminStore.fetchTags(undefined, { force: true })
}

async function addCategory() {
  if (!categoryForm.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  addCategoryVisible.value = true
}

async function confirmAddCategory() {
  await adminStore.createCategory({
    name: categoryForm.name.trim(),
    sort_order: categoryForm.sort_order,
    status: 'normal',
  })
  addCategoryVisible.value = false
  categoryForm.name = ''
  ElMessage.success('分类已新增')
}

async function addTag() {
  if (!tagForm.name.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }
  addTagVisible.value = true
}

async function confirmAddTag() {
  await adminStore.createTag({ name: tagForm.name.trim(), color: tagForm.color, status: 'normal' })
  addTagVisible.value = false
  tagForm.name = ''
  ElMessage.success('标签已新增')
}

function openSaveCategory(id: number, name: string, sortOrder?: number) {
  pendingSaveCategory.value = { id, name, sortOrder }
  saveCategoryVisible.value = true
}

async function confirmSaveCategory() {
  if (!pendingSaveCategory.value) return
  const { id, name, sortOrder } = pendingSaveCategory.value
  await adminStore.updateCategory(id, {
    name: name.trim(),
    sort_order: sortOrder,
    status: 'normal',
  })
  saveCategoryVisible.value = false
  ElMessage.success('分类已更新')
}

function openSaveTag(id: number, name: string, color?: string) {
  pendingSaveTag.value = { id, name, color }
  saveTagVisible.value = true
}

async function confirmSaveTag() {
  if (!pendingSaveTag.value) return
  const { id, name, color } = pendingSaveTag.value
  await adminStore.updateTag(id, { name: name.trim(), color, status: 'normal' })
  saveTagVisible.value = false
  ElMessage.success('标签已更新')
}

function openDelete(type: 'category' | 'tag', id: number, name: string) {
  pendingDelete.value = { type, id, name }
  deleteVisible.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  if (pendingDelete.value.type === 'category') {
    await adminStore.deleteCategory(pendingDelete.value.id)
  } else {
    await adminStore.deleteTag(pendingDelete.value.id)
  }
  deleteVisible.value = false
  ElMessage.success('已删除')
}
</script>

<template>
  <div class="taxonomy-page">
    <section class="taxonomy-panel">
      <div class="panel-title">
        <h2>
          <ElIcon><Folder /></ElIcon>分类管理
        </h2>
        <form @submit.prevent="addCategory">
          <input v-model="categoryForm.name" placeholder="新增分类名称" />
          <input v-model.number="categoryForm.sort_order" type="number" min="0" />
          <button type="submit">
            <ElIcon><Plus /></ElIcon>新增
          </button>
          <button class="ghost-button" type="button" @click="refreshTaxonomy">
            <ElIcon><RefreshRight /></ElIcon>刷新
          </button>
        </form>
      </div>

      <div class="taxonomy-grid">
        <article v-for="category in adminStore.categories" :key="category.id" class="taxonomy-card">
          <input v-model="category.name" maxlength="24" />
          <textarea
            :value="`${category.image_count || 0} 张图片 · 排序 ${category.sort_order || 0}`"
            readonly
          />
          <div class="card-actions">
            <button
              type="button"
              @click="openSaveCategory(category.id, category.name, category.sort_order)"
            >
              保存
            </button>
            <button
              class="danger"
              type="button"
              @click="openDelete('category', category.id, category.name)"
            >
              <ElIcon><Delete /></ElIcon>
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="taxonomy-panel">
      <div class="panel-title">
        <h2>
          <ElIcon><PriceTag /></ElIcon>标签管理
        </h2>
        <form @submit.prevent="addTag">
          <input v-model="tagForm.name" placeholder="新增标签名称" />
          <input v-model="tagForm.color" type="color" />
          <button type="submit">
            <ElIcon><Plus /></ElIcon>新增
          </button>
        </form>
      </div>

      <div class="tag-wall">
        <article v-for="tag in adminStore.tags" :key="tag.id" class="tag-card">
          <span class="color-dot" :style="{ background: tag.color || '#ffd6e5' }" />
          <input v-model="tag.name" maxlength="24" />
          <small>{{ tag.usage_count || 0 }} 次使用</small>
          <input v-model="tag.color" class="color-input" type="color" />
          <button type="button" @click="openSaveTag(tag.id, tag.name, tag.color)">保存</button>
          <button class="danger" type="button" @click="openDelete('tag', tag.id, tag.name)">
            <ElIcon><Delete /></ElIcon>
          </button>
        </article>
      </div>
    </section>

    <ConfirmDialog
      v-model="saveCategoryVisible"
      title="确认保存分类吗？"
      description="分类名称和排序将被更新。"
      confirm-text="保存"
      @confirm="confirmSaveCategory"
    />

    <ConfirmDialog
      v-model="saveTagVisible"
      title="确认保存标签吗？"
      description="标签名称和颜色将被更新。"
      confirm-text="保存"
      @confirm="confirmSaveTag"
    />

    <ConfirmDialog
      v-model="addCategoryVisible"
      title="确认新增分类吗？"
      :description="`分类名称：${categoryForm.name.trim()}，排序：${categoryForm.sort_order}`"
      confirm-text="新增"
      @confirm="confirmAddCategory"
    />

    <ConfirmDialog
      v-model="addTagVisible"
      title="确认新增标签吗？"
      :description="`标签名称：${tagForm.name.trim()}`"
      confirm-text="新增"
      @confirm="confirmAddTag"
    />

    <ConfirmDialog
      v-model="deleteVisible"
      danger
      title="确认删除吗？"
      :description="`「${pendingDelete?.name || ''}」正在被图片使用时后端会拒绝删除。`"
      confirm-text="删除"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped lang="scss">
.taxonomy-page {
  display: grid;
  gap: 24px;
}

.taxonomy-panel {
  padding: 26px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 30px;
  box-shadow: $shadow-soft;
  backdrop-filter: blur(18px);
}

.panel-title {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;

  h2 {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    margin: 0;
    color: $color-primary;
    font-size: 24px;
    font-weight: 600;
  }

  form {
    display: flex;
    gap: 10px;
  }
}

input,
textarea {
  min-height: 42px;
  padding: 0 14px;
  color: $color-text-main;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(161, 72, 120, 0.18);
  border-radius: 16px;
  outline: none;
}

textarea {
  min-height: 70px;
  padding-top: 12px;
  resize: none;
}

button {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  color: $color-text-white;
  cursor: pointer;
  background: $gradient-primary;
  border: 0;
  border-radius: $radius-pill;
}

.danger {
  color: #c64357;
  background: rgba(255, 226, 233, 0.9);
}

.ghost-button {
  color: $color-primary;
  background: rgba(255, 241, 246, 0.92);
}

.taxonomy-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.taxonomy-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  background: $gradient-card-pink;
  border-radius: 24px;
}

.card-actions,
.tag-card {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tag-wall {
  display: grid;
  gap: 12px;
}

.tag-card {
  flex-wrap: wrap;
  padding: 14px;
  background: rgba(255, 248, 251, 0.78);
  border-radius: 18px;

  input:not(.color-input) {
    flex: 1;
    min-width: 180px;
  }

  small {
    color: $color-text-light;
  }
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.color-input {
  width: 48px;
  padding: 4px;
}

@media (max-width: 980px) {
  .panel-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .taxonomy-grid {
    grid-template-columns: 1fr;
  }
}
</style>
