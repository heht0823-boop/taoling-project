<script setup lang="ts">
defineProps<{
  name: 'search' | 'filter' | 'arrow-down' | 'refresh' | 'star' | 'download' | 'close' | 'warning'
}>()
</script>

<template>
  <svg class="app-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <template v-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </template>
    <template v-else-if="name === 'filter'">
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </template>
    <template v-else-if="name === 'arrow-down'">
      <path d="m7 10 5 5 5-5" />
    </template>
    <template v-else-if="name === 'refresh'">
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v6h-6" />
    </template>
    <template v-else-if="name === 'star'">
      <path d="m12 3 2.75 5.57 6.15.89-4.45 4.34 1.05 6.12L12 17.03 6.5 19.92l1.05-6.12L3.1 9.46l6.15-.89L12 3Z" />
    </template>
    <template v-else-if="name === 'download'">
      <path d="M12 3v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </template>
    <template v-else>
      <path d="M12 3 2.8 20h18.4L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </template>
  </svg>
</template>

<style scoped lang="scss">
.app-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  color: currentColor;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  vertical-align: -0.125em;
}
</style>
