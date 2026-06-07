<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Lock, House } from '@element-plus/icons-vue'

import TaolingMascot from '@/components/business/TaolingMascot.vue'

const router = useRouter()
</script>

<template>
  <main class="permission-page">
    <section class="permission-card">
      <TaolingMascot state="permission" size="md" />
      <div class="permission-copy">
        <span class="eyebrow">
          <ElIcon><Lock /></ElIcon>
          管理员专属
        </span>
        <h1>这里需要管理员权限</h1>
        <p>桃灵把上传、分类、标签、用户与日志管理都收在控制台里，普通账号暂时不能进入。</p>
        <button type="button" @click="router.push('/home')">
          <ElIcon><House /></ElIcon>
          返回首页
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.permission-page {
  min-height: calc(100vh - 220px);
  padding: 190px clamp(20px, 7vw, 110px) 90px;
}

.permission-card {
  display: grid;
  grid-template-columns: minmax(220px, 0.72fr) 1fr;
  gap: clamp(24px, 5vw, 72px);
  align-items: center;
  max-width: 980px;
  padding: clamp(34px, 6vw, 70px);
  margin: 0 auto;
  background:
    radial-gradient(circle at 88% 18%, rgba(234, 223, 255, 0.7), transparent 32%),
    linear-gradient(135deg, rgba(255, 241, 246, 0.92), rgba(255, 255, 255, 0.82));
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 34px;
  box-shadow: 0 24px 64px rgba(161, 72, 120, 0.1);
}

.permission-copy {
  display: grid;
  gap: 18px;
}

.eyebrow {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  width: fit-content;
  padding: 8px 16px;
  color: $color-primary;
  background: rgba(255, 214, 229, 0.56);
  border-radius: $radius-pill;
}

h1 {
  margin: 0;
  color: $color-text-main;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 600;
  letter-spacing: 0;
}

p {
  max-width: 560px;
  margin: 0;
  color: $color-text-secondary;
  font-size: 17px;
  line-height: 1.9;
}

button {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 46px;
  padding: 0 28px;
  color: $color-text-white;
  cursor: pointer;
  background: $gradient-primary;
  border: 0;
  border-radius: $radius-pill;
  box-shadow: $shadow-button;
}

@media (max-width: 760px) {
  .permission-card {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .permission-copy,
  .eyebrow,
  button {
    justify-self: center;
  }
}
</style>
