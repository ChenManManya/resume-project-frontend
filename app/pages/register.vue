<script setup lang="ts">
import AppTopNav from '~/components/AppTopNav.vue'
import { useAuthState } from '~/composables/useAuthState'
import { getCaptcha, register } from '~/apis/authApi'

const form = reactive({
  username: '',
  password: '',
  email: '',
  captchaCode: '',
  captchaKey: ''
})

const captchaImage = ref('')
const errorMessage = ref('')
const loading = ref(false)
const authState = useAuthState()
const { $message } = useNuxtApp()
const refreshCaptcha = async () => {
  try {
    const {data, error} = await getCaptcha()
    form.captchaKey = data.value.captchaKey
    form.captchaCode = ''
    captchaImage.value = data.value.captchaImage
    errorMessage.value = ''
  } catch (error: any) {
    errorMessage.value = error?.message || '验证码获取失败，请稍后重试'
  }
}

const submitRegister = async () => {
  
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await register({
      username: form.username,
      password: form.password,
      email: form.email,
      captchaCode: form.captchaCode,
      captchaKey: form.captchaKey
    })

    if (error.value) {
      $message.warning(error.value || '注册失败，请检查输入内容')
      await refreshCaptcha()
      return
    }
    $message.success('注册成功，正在跳转到登录页面...')
    authState.refresh()
    await navigateTo('/login')
  } catch (error: any) {
    errorMessage.value = error?.message || '注册失败，请检查输入内容'
    await refreshCaptcha()
  } finally {
    loading.value = false
  }
}

const toLoginPage = () => {
  navigateTo('/login')
}

onMounted(() => {
  void refreshCaptcha()
})
</script>

<template>
  <div class="register-page">
    <AppTopNav />
    <div class="register-shell">
      <section class="register-card">
        <div class="register-card__header">
          <span>创建账号</span>
          <h1>注册后开始创建你的第一份简历</h1>
        </div>
        <n-alert v-if="errorMessage" type="error" :show-icon="false" class="register-alert">
          {{ errorMessage }}
        </n-alert>
        <div class="register-form">
          <label>
            <span>用户名</span>
            <n-input v-model:value="form.username" placeholder="请输入用户名!"/>
          </label>
          <label>
            <span>邮箱</span>
            <n-input v-model:value="form.email" placeholder="请输入邮箱地址"/>
          </label>
          <label>
            <span>密码</span>
            <n-input v-model:value="form.password" type="password" show-password-on="mousedown" placeholder="请输入密码"/>
          </label>
          <div class="register-captcha-row">
            <label>
              <span>验证码</span>
              <n-input v-model:value="form.captchaCode" placeholder="请输入验证码"/>
            </label>
            <button class="captcha-box" type="button" @click="refreshCaptcha">
              <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
              <span v-else>刷新验证码</span>
            </button>
          </div>
          <n-button type="primary" block size="large" :loading="loading" @click="submitRegister">注册账号</n-button>
          <n-button type="ghost" block size="large" :loading="loading" @click="toLoginPage">已有账号？去登录</n-button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.14), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef2ff 100%);
}

.register-shell {
  width: min(640px, calc(100% - 32px));
  margin: 32px auto;
}

.register-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
  border-radius: 28px;
  padding: 28px;
}

.register-alert {
  margin-bottom: 16px;
}

.register-card__header {
  margin-bottom: 18px;

  span {
    color: #64748b;
    font-size: 13px;
  }

  h1 {
    margin: 8px 0 0;
    color: #111827;
    font-size: 30px;
    line-height: 1.3;
  }
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    font-size: 13px;
    color: #475569;
  }
}

.register-captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px;
  gap: 12px;
}

.captcha-box {
  align-self: end;
  height: 44px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #fff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    color: #2563eb;
    font-size: 13px;
  }
}

@media (max-width: 760px) {
  .register-shell {
    width: min(100%, calc(100% - 24px));
  }

  .register-captcha-row {
    grid-template-columns: 1fr;
  }
}
</style>
