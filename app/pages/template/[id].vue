<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()

const templates = [
  {
    id: '1',
    title: '简洁专业简历模板',
    summary: '适合校招与社招的通用模板，结构清晰，排版克制。',
    tags: ['双栏', '技术岗', 'ATS 友好'],
    metrics: ['A4 单页优先', '支持后端 PDF 导出', '适合前端 / 后端 / 产品'],
    sections: ['基本信息', '教育经历', '项目经历', '技能专长']
  },
  {
    id: '2',
    title: '品牌感运营模板',
    summary: '更强调内容节奏与表达气质，适合运营、品牌与内容岗位。',
    tags: ['品牌感', '运营岗', '图文节奏'],
    metrics: ['适合多段经历', '支持自定义模块', '适合内容岗位'],
    sections: ['基本信息', '工作经历', '项目经历', '自我介绍']
  }
]

const template = computed(() => templates.find((item) => item.id === String(route.params.id)) ?? templates[0])
</script>

<template>
  <div class="template-page">
    <div class="template-shell">
      <NuxtLink class="template-back" to="/">返回模板广场</NuxtLink>

      <section class="template-hero">
        <div>
          <span class="template-kicker">模板详情</span>
          <h1>{{ template.title }}</h1>
          <p>{{ template.summary }}</p>
          <div class="template-tags">
            <span v-for="tag in template.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <div class="template-cta">
          <NuxtLink class="template-cta__button" :to="`/maker?templateId=${template.id}`">使用这个模板</NuxtLink>
          <small>进入编辑器后可继续调整字体、主色与排版。</small>
        </div>
      </section>

      <section class="template-grid">
        <article class="template-panel">
          <div class="template-panel__preview">
            <div class="preview-paper">
              <div class="preview-paper__avatar" />
              <div class="preview-paper__line preview-paper__line--lg" />
              <div class="preview-paper__line preview-paper__line--md" />
              <div class="preview-paper__section" v-for="section in template.sections" :key="section">
                <strong>{{ section }}</strong>
                <div class="preview-paper__line" />
              </div>
            </div>
          </div>
        </article>

        <article class="template-panel">
          <div class="template-panel__header">
            <span>模板亮点</span>
          </div>
          <ul class="template-metrics">
            <li v-for="metric in template.metrics" :key="metric">{{ metric }}</li>
          </ul>

          <div class="template-panel__header">
            <span>推荐板块</span>
          </div>
          <div class="template-sections">
            <span v-for="section in template.sections" :key="section">{{ section }}</span>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.template-page {
  min-height: 100vh;
  padding: 32px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef2ff 100%);
}

.template-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.template-back,
.template-kicker {
  color: #2563eb;
  font-size: 13px;
}

.template-hero,
.template-panel {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
  border-radius: 28px;
}

.template-hero {
  margin-top: 16px;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  gap: 20px;

  h1 {
    margin: 10px 0;
    font-size: 36px;
    color: #111827;
  }

  p {
    margin: 0;
    color: #475569;
    line-height: 1.8;
  }
}

.template-tags,
.template-sections {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;

  span {
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.08);
    color: #2563eb;
    font-size: 13px;
  }
}

.template-cta {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.template-cta__button {
  display: inline-flex;
  justify-content: center;
  padding: 14px 18px;
  border-radius: 16px;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
}

.template-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  margin-top: 20px;
}

.template-panel {
  padding: 24px;
}

.template-panel__header {
  margin-bottom: 12px;

  span {
    color: #111827;
    font-size: 16px;
    font-weight: 600;
  }
}

.template-panel__preview {
  display: flex;
  justify-content: center;
}

.preview-paper {
  width: min(100%, 420px);
  padding: 22px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.preview-paper__avatar {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%);
  margin-bottom: 16px;
}

.preview-paper__line {
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #dbeafe 0%, #e5e7eb 100%);
  margin-bottom: 10px;
}

.preview-paper__line--lg { width: 60%; }
.preview-paper__line--md { width: 40%; }

.preview-paper__section {
  margin-top: 16px;

  strong {
    display: block;
    color: #2563eb;
    margin-bottom: 8px;
  }
}

.template-metrics {
  display: grid;
  gap: 10px;
  margin: 0 0 20px;
  padding-left: 18px;
  color: #475569;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .template-page {
    padding: 20px;
  }

  .template-hero,
  .template-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .template-cta {
    width: 100%;
  }
}
</style>
