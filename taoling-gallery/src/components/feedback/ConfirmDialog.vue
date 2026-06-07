<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from '@/components/icons/AppIcon.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
    danger?: boolean
  }>(),
  {
    title: '确认操作',
    description: '桃灵需要确认一下，是否继续执行这个操作？',
    confirmText: '确认',
    cancelText: '取消',
    loading: false,
    danger: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const dialogClass = computed(() => ({ 'is-danger': props.danger }))

function closeDialog() {
  if (props.loading) {
    return
  }

  emit('update:modelValue', false)
  emit('cancel')
}

function confirmDialog() {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="modelValue" class="confirm-mask" @click.self="closeDialog">
        <section class="confirm-dialog" :class="dialogClass" role="dialog" aria-modal="true">
          <button class="close-button" type="button" aria-label="关闭弹窗" @click="closeDialog">
            <AppIcon name="close" class="close-icon" />
          </button>

          <div class="dialog-icon">
            <AppIcon name="warning" class="warning-icon" />
          </div>

          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
          <div class="dialog-body">
            <slot />
          </div>

          <div class="dialog-actions">
            <button class="cancel-button" type="button" :disabled="loading" @click="closeDialog">
              {{ cancelText }}
            </button>
            <button class="confirm-button" type="button" :disabled="loading" @click="confirmDialog">
              {{ loading ? '处理中...' : confirmText }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.confirm-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(78, 45, 72, 0.16);
  backdrop-filter: blur(10px);
}

.confirm-dialog {
  position: relative;
  width: min(420px, 100%);
  padding: 34px;
  text-align: center;
  background:
    radial-gradient(circle at 84% 8%, rgba(255, 214, 229, 0.78), transparent 34%),
    rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 30px;
  box-shadow: 0 28px 68px rgba(161, 72, 120, 0.18);
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  color: $color-text-light;
  cursor: pointer;
  background: rgba(255, 245, 249, 0.82);
  border: 0;
  border-radius: 50%;
}

.close-icon,
.warning-icon {
  width: 1em;
  height: 1em;
}

.dialog-icon {
  display: grid;
  width: 58px;
  height: 58px;
  margin: 0 auto 18px;
  place-items: center;
  color: $color-primary;
  font-size: 26px;
  background: $gradient-card-pink;
  border-radius: 50%;
  box-shadow: 0 12px 28px rgba(161, 72, 120, 0.12);
}

h2 {
  margin: 0;
  color: $color-text-main;
  font-size: 24px;
  font-weight: 600;
}

p {
  margin: 12px 0 0;
  color: $color-text-secondary;
  font-size: 15px;
  line-height: 1.8;
}

.dialog-body {
  margin-top: 18px;
}

.dialog-body:empty {
  display: none;
}

.dialog-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 28px;
}

.cancel-button,
.confirm-button {
  min-height: 44px;
  cursor: pointer;
  border: 0;
  border-radius: $radius-pill;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }
}

.cancel-button {
  color: $color-text-secondary;
  background: rgba(255, 241, 246, 0.9);
}

.confirm-button {
  color: $color-text-white;
  background: $gradient-primary;
  box-shadow: $shadow-button;
}

.is-danger .dialog-icon {
  color: #c66375;
  background: linear-gradient(135deg, #ffe0e8 0%, #fff3f6 100%);
}

.is-danger .confirm-button {
  background: linear-gradient(135deg, #f57b9f 0%, #a14878 100%);
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;

  .confirm-dialog {
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;

  .confirm-dialog {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
}
</style>
