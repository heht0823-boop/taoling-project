<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowRight, Lock, Message, User, View } from '@element-plus/icons-vue'

import TaolingMascot from '@/components/business/TaolingMascot.vue'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import { useUserStore } from '@/stores/user'

type AuthMode = 'login' | 'register'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const mode = ref<AuthMode>('login')
const forgotVisible = ref(false)

const REMEMBER_KEY = 'taoling_remember'

function loadRememberedAccount() {
  try {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      if (data.account) {
        loginForm.account = data.account
        loginForm.remember = true
      }
    }
  } catch {
    // 忽略解析错误
  }
}

function saveRememberedAccount() {
  if (loginForm.remember) {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify({ account: loginForm.account }))
  } else {
    localStorage.removeItem(REMEMBER_KEY)
  }
}

const loginForm = reactive({
  account: '',
  password: '',
  remember: false,
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isLogin = computed(() => mode.value === 'login')
const submitText = computed(() => (isLogin.value ? '登录' : '注册'))
const activeForm = computed(() => (isLogin.value ? loginForm : registerForm))

const rules = computed<FormRules>(() => {
  if (isLogin.value) {
    return {
      account: [{ required: true, message: '请输入账号或邮箱', trigger: 'blur' }],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码至少 6 位', trigger: 'blur' },
      ],
    }
  }

  return {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 24, message: '用户名为 2-24 个字符', trigger: 'blur' },
    ],
    email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码至少 6 位', trigger: 'blur' },
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      {
        validator: (_rule, value: string, callback) => {
          if (value !== registerForm.password) {
            callback(new Error('两次输入的密码不一致'))
            return
          }

          callback()
        },
        trigger: 'blur',
      },
    ],
  }
})

function switchMode(nextMode: AuthMode) {
  mode.value = nextMode
  formRef.value?.clearValidate()
}

function showForgotPassword() {
  forgotVisible.value = true
}

async function submitAuth() {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  if (isLogin.value) {
    await userStore.login({
      account: loginForm.account,
      password: loginForm.password,
    })

    saveRememberedAccount()
    ElMessage.success('欢迎回来，桃灵已经为你打开首页')
    await goAfterAuth()
    return
  }

  await userStore.register({
    username: registerForm.username,
    email: registerForm.email,
    password: registerForm.password,
  })

  ElMessage.success('注册成功，桃灵已经为你打开首页')
  await goAfterAuth()
}

async function goAfterAuth() {
  await router.push('/home')
}

async function enterAsGuest() {
  await router.push('/home')
}

onMounted(() => {
  loadRememberedAccount()
})
</script>

<template>
  <section class="auth-view">
    <div class="auth-glow auth-glow--peach" />
    <div class="auth-glow auth-glow--violet" />

    <div class="auth-stage">
      <div class="brand-panel" aria-label="桃灵图库角色桃灵">
        <div class="mascot-stage">
          <TaolingMascot :state="isLogin ? 'welcome' : 'guide'" autoplay size="lg" />
        </div>
      </div>

      <div class="auth-panel">
        <div class="auth-card">
          <header class="auth-header">
            <h1>桃灵图库</h1>
            <p>发现、收藏、下载属于你的 AI 图片灵感。</p>
          </header>

          <div class="mode-tabs" role="tablist" aria-label="登录注册切换">
            <button
              class="mode-tab"
              :class="{ 'is-active': isLogin }"
              type="button"
              role="tab"
              :aria-selected="isLogin"
              @click="switchMode('login')"
            >
              登录
            </button>
            <button
              class="mode-tab"
              :class="{ 'is-active': !isLogin }"
              type="button"
              role="tab"
              :aria-selected="!isLogin"
              @click="switchMode('register')"
            >
              注册
            </button>
          </div>

          <ElForm
            ref="formRef"
            class="auth-form"
            :model="activeForm"
            :rules="rules"
            size="large"
            @submit.prevent="submitAuth"
          >
            <template v-if="isLogin">
              <ElFormItem prop="account">
                <ElInput v-model="loginForm.account" placeholder="账号/邮箱" clearable>
                  <template #prefix>
                    <ElIcon><User /></ElIcon>
                  </template>
                </ElInput>
              </ElFormItem>

              <ElFormItem prop="password">
                <ElInput
                  v-model="loginForm.password"
                  placeholder="密码"
                  type="password"
                  show-password
                >
                  <template #prefix>
                    <ElIcon><Lock /></ElIcon>
                  </template>
                </ElInput>
              </ElFormItem>

              <div class="form-row">
                <ElCheckbox v-model="loginForm.remember">记住我</ElCheckbox>
                <button class="link-button" type="button" @click="showForgotPassword">
                  忘记密码?
                </button>
              </div>
            </template>

            <template v-else>
              <ElFormItem prop="username">
                <ElInput v-model="registerForm.username" placeholder="用户名" clearable>
                  <template #prefix>
                    <ElIcon><User /></ElIcon>
                  </template>
                </ElInput>
              </ElFormItem>

              <ElFormItem prop="email">
                <ElInput v-model="registerForm.email" placeholder="邮箱（可选）" clearable>
                  <template #prefix>
                    <ElIcon><Message /></ElIcon>
                  </template>
                </ElInput>
              </ElFormItem>

              <ElFormItem prop="password">
                <ElInput
                  v-model="registerForm.password"
                  placeholder="密码"
                  type="password"
                  show-password
                >
                  <template #prefix>
                    <ElIcon><Lock /></ElIcon>
                  </template>
                </ElInput>
              </ElFormItem>

              <ElFormItem prop="confirmPassword">
                <ElInput
                  v-model="registerForm.confirmPassword"
                  placeholder="确认密码"
                  type="password"
                  show-password
                >
                  <template #prefix>
                    <ElIcon><View /></ElIcon>
                  </template>
                </ElInput>
              </ElFormItem>
            </template>

            <ElButton
              class="submit-button"
              type="primary"
              native-type="submit"
              :loading="userStore.loading"
            >
              {{ submitText }}
              <ElIcon v-if="!userStore.loading"><ArrowRight /></ElIcon>
            </ElButton>
          </ElForm>

          <div class="divider">
            <span />
            <em>或</em>
            <span />
          </div>

          <button class="guest-button" type="button" @click="enterAsGuest">
            <ElIcon><View /></ElIcon>
            游客体验入口
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model="forgotVisible"
      title="找回密码"
      description="你搞忘了关我什么事，好像我知道一样"
      confirm-text="好吧"
      @confirm="forgotVisible = false"
    />
  </section>
</template>

<style scoped lang="scss">
.auth-view {
  position: relative;
  display: grid;
  min-height: 100vh;
  overflow: hidden;
  place-items: center;
  padding: clamp(28px, 5vw, 72px);
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 153, 190, 0.28), transparent 28%),
    radial-gradient(circle at 80% 78%, rgba(157, 127, 255, 0.26), transparent 30%),
    linear-gradient(135deg, #fff8fb 0%, #fff0f6 38%, #e8f6ff 72%, #efe4ff 100%);
}

.auth-glow {
  position: absolute;
  width: min(42vw, 520px);
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.72;
  pointer-events: none;

  &::before,
  &::after {
    position: absolute;
    inset: 0;
    content: '';
    border-radius: inherit;
  }

  &::before {
    background: repeating-radial-gradient(
      circle,
      rgba(255, 125, 175, 0.28) 0 3px,
      rgba(255, 255, 255, 0.2) 4px 8px,
      transparent 9px 15px
    );
  }

  &::after {
    inset: 16px;
    background: radial-gradient(circle, rgba(255, 149, 190, 0.62), transparent 68%);
  }
}

.auth-glow--peach {
  top: 6%;
  left: -5%;
}

.auth-glow--violet {
  right: -4%;
  bottom: 2%;

  &::before {
    background: repeating-radial-gradient(
      circle,
      rgba(139, 110, 234, 0.24) 0 3px,
      rgba(191, 233, 255, 0.2) 4px 8px,
      transparent 9px 15px
    );
  }

  &::after {
    background: radial-gradient(circle, rgba(197, 182, 255, 0.7), transparent 68%);
  }
}

.auth-stage {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(340px, 440px);
  align-items: center;
  width: min(1320px, 100%);
  min-height: min(820px, calc(100vh - 96px));
  padding: clamp(56px, 8vw, 116px);
  background:
    linear-gradient(90deg, rgba(255, 203, 214, 0.78) 0%, rgba(255, 246, 250, 0.68) 38%),
    linear-gradient(
      135deg,
      rgba(255, 226, 233, 0.82) 0%,
      rgba(223, 242, 255, 0.88) 68%,
      rgba(225, 211, 255, 0.86) 100%
    );
  box-shadow: 0 30px 90px rgba(134, 93, 149, 0.18);
}

.brand-panel {
  display: flex;
  justify-content: center;
}

.mascot-stage {
  display: grid;
  width: min(560px, 92%);
  min-height: 420px;
  place-items: center;
}

.auth-panel {
  display: flex;
  justify-content: flex-end;
}

.auth-card {
  @include peach-card;

  width: min(440px, 100%);
  padding: clamp(22px, 2.6vw, 32px);
  border-color: rgba(255, 255, 255, 0.74);
  border-radius: 48px;
  background:
    radial-gradient(circle at 88% 10%, rgba(255, 224, 234, 0.72), transparent 34%),
    rgba(255, 255, 255, 0.56);
}

.auth-header {
  text-align: center;

  h1 {
    margin: 0;
    color: transparent;
    font-size: clamp(30px, 3vw, 40px);
    font-weight: 700;
    letter-spacing: 0;
    background: linear-gradient(90deg, $color-primary 0%, $color-secondary 100%);
    background-clip: text;
  }

  p {
    margin: 10px 0 0;
    color: $color-text-secondary;
    font-size: 15px;
    line-height: 1.8;
  }
}

.mode-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin: 18px 0 18px;
  padding: 4px;
  border-radius: $radius-pill;
  background: rgba(255, 218, 226, 0.64);
}

.mode-tab {
  min-height: 40px;
  color: $color-text-secondary;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: $radius-pill;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &.is-active {
    color: $color-text-white;
    background: $color-primary;
    box-shadow: 0 8px 18px rgba(161, 72, 120, 0.22);
  }
}

.auth-form {
  :deep(.el-form-item) {
    margin-bottom: 14px;
  }

  :deep(.el-input__wrapper) {
    min-height: 48px;
    padding: 0 18px;
    border: 1px solid rgba(51, 40, 50, 0.52);
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: none;
  }

  :deep(.el-input__inner) {
    color: $color-text-main;
  }

  :deep(.el-input__prefix),
  :deep(.el-input__suffix) {
    color: $color-text-light;
  }
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 14px;

  :deep(.el-checkbox__label) {
    color: $color-text-secondary;
  }

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background: $color-primary-light;
    border-color: $color-primary-light;
  }
}

.link-button {
  color: $color-primary;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.submit-button {
  @include peach-button;

  width: 100%;
  min-height: 50px;
  font-size: 20px;

  :deep(.el-icon) {
    margin-left: 8px;
  }
}

.divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 18px;
  align-items: center;
  margin: 22px 0 14px;
  color: $color-text-light;
  font-style: normal;

  span {
    height: 1px;
    background: rgba(161, 72, 120, 0.16);
  }

  em {
    font-style: normal;
  }
}

.guest-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  color: $color-text-main;
  font-size: 19px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(244, 139, 181, 0.22);
  border-radius: $radius-pill;
  box-shadow: 0 12px 28px rgba(161, 72, 120, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  .el-icon {
    margin-right: 10px;
    color: $color-secondary;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 34px rgba(161, 72, 120, 0.13);
  }
}

@media (max-width: 980px) {
  .auth-stage {
    grid-template-columns: 1fr;
    gap: 36px;
    padding: 36px;
  }

  .auth-panel {
    justify-content: center;
  }

  .mascot-stage {
    min-height: 320px;
  }
}

@media (max-width: 640px) {
  .auth-view {
    padding: 18px;
  }

  .auth-stage {
    min-height: auto;
    padding: 22px;
  }

  .mascot-stage {
    min-height: 250px;
  }

  .auth-card {
    padding: 26px 20px;
    border-radius: 32px;
  }

  .auth-form :deep(.el-input__wrapper),
  .submit-button,
  .guest-button {
    min-height: 52px;
  }
}
</style>
