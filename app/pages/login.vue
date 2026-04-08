<script setup lang="ts">
const features = [
  '云端自动保存简历内容',
  '一键切换模板与排版预设',
  '支持打印版与后端导出'
]
</script>

<template>
  <div class="login-page">
    <div class="login-shell">
      <section class="login-hero">
        <NuxtLink class="login-back" to="/">返回首页</NuxtLink>
        <span class="login-kicker">慢慢简历</span>
        <h1>登录后继续整理你的简历内容，并在任意设备上接着编辑。</h1>
        <p>
          这是一套偏产品化的登录界面，延续你当前站点的浅蓝、柔和阴影与卡片语言，适合后续直接接入短信、邮箱或账号密码登录。
        </p>

        <div class="login-feature-list">
          <div v-for="feature in features" :key="feature" class="login-feature">
            <span />
            <strong>{{ feature }}</strong>
          </div>
        </div>
      </section>

      <section class="login-card">
        <div class="login-card__header">
          <span>账号登录</span>
          <h2>欢迎回来</h2>
        </div>

        <div class="login-form">
          <label>
            <span>手机号 / 邮箱</span>
            <n-input placeholder="请输入手机号或邮箱" />
          </label>
          <label>
            <span>密码</span>
            <n-input type="password" show-password-on="mousedown" placeholder="请输入密码" />
          </label>
          <div class="login-form__row">
            <n-checkbox>7天内免登录</n-checkbox>
            <a href="#">忘记密码</a>
          </div>
          <n-button type="primary" block size="large">登录并继续编辑</n-button>
          <n-button block size="large">注册新账号</n-button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.14), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef2ff 100%);
}

.login-shell {
  width: min(1120px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 420px;
  gap: 24px;
}

.login-hero,
.login-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
  border-radius: 28px;
}

.login-hero {
  padding: 36px;
}

.login-back,
.login-kicker {
  display: inline-flex;
  margin-bottom: 16px;
  color: #2563eb;
  font-size: 13px;
}

.login-hero h1 {
  margin: 0 0 16px;
  font-size: 42px;
  line-height: 1.1;
  color: #111827;
}

.login-hero p {
  margin: 0;
  max-width: 640px;
  line-height: 1.85;
  color: #475569;
}

.login-feature-list {
  display: grid;
  gap: 14px;
  margin-top: 28px;
}

.login-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #ffffff;

  span {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #2563eb;
  }
}

.login-card {
  padding: 28px;
}

.login-card__header {
  margin-bottom: 20px;

  span {
    color: #64748b;
    font-size: 13px;
  }

  h2 {
    margin: 8px 0 0;
    color: #111827;
    font-size: 28px;
  }
}

.login-form {
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

.login-form__row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  a {
    color: #2563eb;
    font-size: 13px;
  }
}

@media (max-width: 960px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-hero h1 {
    font-size: 34px;
  }
}
</style>
