<script setup lang="ts">
const stats = [
  { label: '简历总数', value: '08' },
  { label: '最近更新', value: '2 天前' },
  { label: '导出次数', value: '36' }
]

const resumes = [
  { title: '前端开发简历', meta: '简洁模板 · 已保存', href: '/maker?resumeId=123' },
  { title: '产品运营简历', meta: '品牌感模板 · 草稿中', href: '/maker?resumeId=124' },
  { title: '校招双栏简历', meta: '程序员模板 · 已导出', href: '/maker?resumeId=125' }
]
</script>

<template>
  <div class="personal-page">
    <div class="personal-shell">
      <section class="personal-hero">
        <div>
          <span class="personal-kicker">个人中心</span>
          <h1>你好，继续完善你的简历资产，把模板、版本和导出记录放在一个地方管理。</h1>
        </div>
        <n-button type="primary" size="large" @click="navigateTo('/maker')">新建简历</n-button>
      </section>

      <section class="personal-stats">
        <article v-for="item in stats" :key="item.label" class="personal-stat-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </section>

      <section class="personal-grid">
        <article class="personal-panel">
          <div class="personal-panel__header">
            <span>最近编辑</span>
            <NuxtLink to="/maker">进入编辑器</NuxtLink>
          </div>
          <div class="resume-list">
            <NuxtLink v-for="resume in resumes" :key="resume.title" :to="resume.href" class="resume-list__item">
              <strong>{{ resume.title }}</strong>
              <small>{{ resume.meta }}</small>
            </NuxtLink>
          </div>
        </article>

        <article class="personal-panel">
          <div class="personal-panel__header">
            <span>快捷操作</span>
          </div>
          <div class="action-grid">
            <NuxtLink to="/maker" class="action-card">继续编辑</NuxtLink>
            <NuxtLink to="/login" class="action-card">账号安全</NuxtLink>
            <NuxtLink to="/template/1" class="action-card">查看模板</NuxtLink>
            <button class="action-card" type="button">导出记录</button>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.personal-page {
  min-height: 100vh;
  padding: 32px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef2ff 100%);
}

.personal-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.personal-hero,
.personal-stat-card,
.personal-panel {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
  border-radius: 28px;
}

.personal-hero {
  padding: 28px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  h1 {
    margin: 8px 0 0;
    max-width: 760px;
    font-size: 34px;
    line-height: 1.25;
    color: #111827;
  }
}

.personal-kicker {
  color: #2563eb;
  font-size: 13px;
}

.personal-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.personal-stat-card {
  padding: 20px;

  span {
    color: #64748b;
    font-size: 13px;
  }

  strong {
    display: block;
    margin-top: 10px;
    color: #111827;
    font-size: 28px;
  }
}

.personal-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
}

.personal-panel {
  padding: 24px;
}

.personal-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  span {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  a {
    color: #2563eb;
    font-size: 13px;
  }
}

.resume-list {
  display: grid;
  gap: 12px;
}

.resume-list__item,
.action-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  color: #111827;
  text-align: left;
}

.resume-list__item small {
  color: #64748b;
}

.action-grid {
  display: grid;
  gap: 12px;
}

@media (max-width: 960px) {
  .personal-page {
    padding: 20px;
  }

  .personal-hero,
  .personal-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .personal-stats {
    grid-template-columns: 1fr;
  }
}
</style>
