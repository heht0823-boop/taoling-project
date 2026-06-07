<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const route = useRoute()
const showHeader = computed(() => route.meta.showHeader !== false)
const showFooter = computed(() => route.meta.showFooter !== false)
</script>

<template>
  <div class="peach-page">
    <AppHeader v-if="showHeader" />
    <main id="main-content" class="app-main">
      <RouterView />
    </main>
    <AppFooter v-if="showFooter" />
  </div>
</template>

<style scoped lang="scss">
.app-main {
  min-height: 100vh;
}
</style>
