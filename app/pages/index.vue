<script setup lang="ts">
import AppTopNav from '~/components/AppTopNav.vue'
import { computed, ref } from 'vue'

type CategoryId =
  | 'all'
  | 'frontend'
  | 'backend'
  | 'product'
  | 'operations'
  | 'campus'
  | 'intern'

type TrackId = 'popular' | 'ats' | 'campus' | 'intern' | 'creative'

interface Stair {
  id: string
  label: string
}

interface FeaturedLane {
  title: string
  subtitle: string
  accent: string
  icon: string
}

interface TemplateCard {
  id: number
  title: string
  summary: string
  accent: string
  badge: string
  categories: CategoryId[]
  tracks: TrackId[]
  tags: string[]
  score: string
}

const categories: Stair[] = [
  { id: 'hot', label: '热门模板' },
  { id: 'common', label: '通用模板'},
]

const quickFilters = ['Java', '前端开发', '实习', '校招', '后端开发', '产品经理']

const featuredLanes: FeaturedLane[] = [
  { title: '热门', subtitle: '最常被投递的简历结构', accent: 'linear-gradient(135deg, #fff1ea 0%, #ffe4d6 100%)', icon: '火' },
  { title: '专业', subtitle: '适合技术与研究型岗位', accent: 'linear-gradient(135deg, #eef3ff 0%, #e3ebff 100%)', icon: '专' },
  { title: '程序员', subtitle: '项目经验优先展示', accent: 'linear-gradient(135deg, #eef9ff 0%, #dff3ff 100%)', icon: '码' },
  { title: '产品', subtitle: '突出方法论与结果复盘', accent: 'linear-gradient(135deg, #fff5e8 0%, #ffe7cc 100%)', icon: '产' },
  { title: '通用', subtitle: '适合多行业快速上手', accent: 'linear-gradient(135deg, #f4f4ff 0%, #ebe9ff 100%)', icon: '通' }
]

const tracks = [
  { id: 'popular' as const, label: '热门模板' },
  { id: 'ats' as const, label: 'ATS 友好' },
  { id: 'campus' as const, label: '校招首选' },
  { id: 'intern' as const, label: '实习高频' },
  { id: 'creative' as const, label: '品牌感' }
]

const templates: TemplateCard[] = [
  {
    id: 1,
    title: '清爽求职简历模板',
    summary: '适合前端、运营和产品岗位，用更轻的视觉把项目结果讲清楚。',
    accent: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
    badge: '热门',
    categories: ['all', 'frontend', 'campus'],
    tracks: ['popular', 'campus'],
    tags: ['校招', '实习', '前端'],
    score: '投递完成率 91%'
  },
  {
    id: 2,
    title: '极简专业简历模板',
    summary: '标题层级更克制，适合后端、算法和技术研究岗位。',
    accent: 'linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%)',
    badge: '专业',
    categories: ['all', 'backend', 'intern'],
    tracks: ['ats', 'intern'],
    tags: ['后端', '项目', '一页式'],
    score: 'ATS 匹配度 95%'
  },
  {
    id: 3,
    title: '双栏项目经历模板',
    summary: '把技能栈和项目拆开展示，更适合程序员岗位快速扫读。',
    accent: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
    badge: '程序员',
    categories: ['all', 'frontend', 'backend'],
    tracks: ['popular', 'ats'],
    tags: ['双栏', '项目', '技术'],
    score: '阅读停留 2.8x'
  },
  {
    id: 4,
    title: '产品复盘简历模板',
    summary: '更强调业务目标、策略拆解和增长结果，适合产品与运营。',
    accent: 'linear-gradient(135deg, #fff3e8 0%, #fffaf2 100%)',
    badge: '产品',
    categories: ['all', 'product', 'operations'],
    tracks: ['creative', 'popular'],
    tags: ['增长', '复盘', '作品集感'],
    score: '面邀转化 84%'
  },
  {
    id: 5,
    title: '校招生首份简历模板',
    summary: '没有实习也能把课程、竞赛和社团整理得更有说服力。',
    accent: 'linear-gradient(135deg, #eefbf3 0%, #f5fff8 100%)',
    badge: '校招',
    categories: ['all', 'campus'],
    tracks: ['campus', 'popular'],
    tags: ['校招', '竞赛', '社团'],
    score: '首份简历友好'
  },
  {
    id: 6,
    title: '品牌感运营模板',
    summary: '强化视觉节奏和内容策划信息，适合新媒体与品牌岗位。',
    accent: 'linear-gradient(135deg, #f5f3ff 0%, #faf8ff 100%)',
    badge: '品牌感',
    categories: ['all', 'operations', 'product'],
    tracks: ['creative'],
    tags: ['运营', '品牌', '内容'],
    score: '视觉辨识高'
  }
]

const activeCategory = ref<CategoryId>('all')
const activeTrack = ref<TrackId>('popular')
const filteredTemplates = computed(() => {
  return templates.filter((template) => {
    const matchesCategory =
      activeCategory.value === 'all' || template.categories.includes(activeCategory.value)
    const matchesTrack = template.tracks.includes(activeTrack.value)

    return matchesCategory && matchesTrack
  })
})


const goAnchor = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const headerOffset = 96
    const title = element.querySelector('h2')
    const target = title instanceof HTMLElement ? title : element
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset

    window.scrollTo({
      top,
      behavior: 'smooth'
    })
  }
}
</script>

<template>
  <div class="home">
    <AppTopNav />

    <main class="main">
      
      <section class="hero-section">
        
        <aside class="category-rail">
          <button
            v-for="category in categories"
            :key="category.id"
            class="rail-item"
            :class="{ 'is-active': activeCategory === category.id }"
            type="button"
            @click="goAnchor(category.id)"
          >
          {{ category.label }}
          </button>
        </aside>
        <div class="hero-panel">
          
          <div class="hero-copy">
            <h1 class="hero-title">写简历从来不必费力</h1>
          </div>

          <div class="hero-search">
              <n-input placeholder="搜索你想投递的岗位、风格或模板关键词" round />
              <n-button class="hero-search-btn" type="primary" round>免费制作</n-button>
          </div>

          <div class="hero-actions">
              <button
                v-for="chip in quickFilters"
                :key="chip"
                class="filter-chip"
                type="button"
              >
                {{ chip }}
              </button>
            </div>
        </div>
      </section>


      <section class="template-section" id="hot">
        <div class="template-toolbar">
          <div class="template-tabs">
            <h2>热门简历模板</h2>
            <button
              v-for="track in tracks"
              :key="track.id"
              class="template-tab"
              :class="{ 'is-active': activeTrack === track.id }"
              type="button"
              @click="activeTrack = track.id"
            >
              {{ track.label }}
            </button>
          </div>

          <a class="template-more" href="#">更多模板</a>
        </div>

        <div class="template-grid">
          <article
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
            :class="{ 'is-selected': template.id === filteredTemplates[0]?.id }"
          >
            <div class="template-preview" :style="{ background: template.accent }">
              <div class="mini-resume">
                <div class="mini-resume__header">
                  <div>
                    <div class="paper-line paper-line--md" />
                    <div class="paper-line paper-line--sm" />
                  </div>
                  <div class="mini-resume__avatar" />
                </div>
                <div class="mini-resume__row">
                  <span />
                  <span />
                  <span />
                </div>
                <div class="mini-resume__section" />
                <div class="mini-resume__section mini-resume__section--wide" />
                <div class="mini-resume__section" />
              </div>
            </div>

            <div class="template-info">
              <div class="template-info__top">
                <h3>{{ template.title }}</h3>
                <span>{{ template.badge }}</span>
              </div>
              <p>{{ template.summary }}</p>
              <div class="scene-tags template-tags">
                <span v-for="tag in template.tags" :key="tag">{{ tag }}</span>
              </div>
              <div class="template-meta">

                <n-button tertiary type="primary" size="small">立即套用</n-button>
              </div>
            </div>


          </article>
        </div>
      </section>

     
      <section class="template-section" id="common">
        <div class="template-toolbar">
          
          <div class="template-tabs">
            <h2>通用简历模板</h2>
            <button
              v-for="track in tracks"
              :key="track.id"
              class="template-tab"
              :class="{ 'is-active': activeTrack === track.id }"
              type="button"
              @click="activeTrack = track.id"
            >
              {{ track.label }}
            </button>
          </div>

          <a class="template-more" href="#">更多模板</a>
        </div>

        <div class="template-grid">
          <article
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
            :class="{ 'is-selected': template.id === filteredTemplates[0]?.id }"
          >
            <div class="template-preview" :style="{ background: template.accent }">
              <div class="mini-resume">
                <div class="mini-resume__header">
                  <div>
                    <div class="paper-line paper-line--md" />
                    <div class="paper-line paper-line--sm" />
                  </div>
                  <div class="mini-resume__avatar" />
                </div>
                <div class="mini-resume__row">
                  <span />
                  <span />
                  <span />
                </div>
                <div class="mini-resume__section" />
                <div class="mini-resume__section mini-resume__section--wide" />
                <div class="mini-resume__section" />
              </div>
            </div>

            <div class="template-info">
              <div class="template-info__top">
                <h3>{{ template.title }}</h3>
                <span>{{ template.badge }}</span>
              </div>
              <p>{{ template.summary }}</p>
              <div class="scene-tags template-tags">
                <span v-for="tag in template.tags" :key="tag">{{ tag }}</span>
              </div>
              <div class="template-meta">

                <n-button tertiary type="primary" size="small">立即套用</n-button>
              </div>
            </div>


          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.12), transparent 26%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}


.main {
  max-width: 1280px;
  margin: 0 auto;
  padding: $spacing-10 $spacing-6 $spacing-16;
  position: relative;
}

.hero-section {
  position: relative;
  padding-bottom: $spacing-12;
}

.category-rail {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: fixed;
  top: 152px;
  left: clamp(12px, calc(50vw - 640px - 104px), 18px);
  width: 108px;
  padding: 8px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow:
    0 14px 30px rgba(15, 23, 42, 0.07),
    0 4px 12px rgba(14, 165, 233, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
  isolation: isolate;
  z-index: 20;

  &::before {
    content: '';
    position: absolute;
    inset: 8px 8px auto;
    height: 24px;
    border-radius: 14px;
    background: radial-gradient(circle at top left, rgba(14, 165, 233, 0.1), transparent 72%);
    z-index: -1;
    pointer-events: none;
  }

  @media (max-width: 1100px) {
    top: 132px;
    left: 10px;
    width: 92px;
    padding: 6px;
    border-radius: 18px;
    box-shadow:
      0 10px 24px rgba(15, 23, 42, 0.06),
      0 3px 10px rgba(14, 165, 233, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);

    .rail-item {
      padding: 8px 6px;
      border-radius: 12px;
    }
  }

  @media (max-width: 680px) {
    display: none;
  }
}

.rail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
  text-align: left;
  transition: transform $transition-normal, border-color $transition-normal, box-shadow $transition-normal;
  flex-shrink: 0;
  min-width: 0;

  &:hover {
    transform: translate3d(4px, 0, 0);
    border-color: rgba($color-primary, 0.16);
    box-shadow: 0 12px 24px rgba(14, 165, 233, 0.1);
  }

  &.is-active {
    border-color: rgba($color-primary, 0.22);
    box-shadow: 0 12px 24px rgba(14, 165, 233, 0.12);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(240, 249, 255, 0.96));
  }

  @media (max-width: 1040px) {
    &:hover {
      transform: translateY(-2px);
    }
  }

  &__icon {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba($color-primary, 0.1);
    color: $color-primary;
    font-size: 11px;
    font-weight: $font-weight-bold;
    letter-spacing: 0.04em;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 0;

    strong {
      color: $color-text-primary;
      font-size: 12px;
      line-height: 1.3;
    }

    small {
      display: none;
    }
  }
}


.hero-panel {
  display: flex;
  flex-direction: column;
  gap: $spacing-8;
  padding: $spacing-8;
  border-radius: 32px;
  background:
    radial-gradient(circle at right top, rgba(125, 211, 252, 0.35), transparent 32%),
    linear-gradient(135deg, #5b80e8 0%, #5f89ef 42%, #6c90ee 100%);
  color: white;
  overflow: hidden;
  box-shadow: 0 32px 90px rgba(91, 128, 232, 0.22);
}

.hero-copy {
  position: relative;
  z-index: 1;
}


.hero-title {
  margin-top: $spacing-5;
  font-size: 2rem;
  line-height: 1.08;
  text-align: center;
  letter-spacing: -0.04em;
  color: white;

  @media (max-width: 960px) {
    font-size: 1.45rem;
  }
}


.hero-search {
  margin-top: $spacing-6;
  display: flex;
  align-items: center;
  gap: $spacing-3;
  width: min(100%, 560px);
  margin: 0 auto;

  :deep(.n-input) {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 680px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
}

.hero-search-btn {
  flex-shrink: 0;

  @media (max-width: 680px) {
    width: 100%;
    margin-right: 0;
  }
}

.hero-actions {
  display: flex;
  gap: $spacing-3;
  margin-top: $spacing-5;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-chip {
  padding: $spacing-2 $spacing-3;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: $font-size-xs;
  transition: background-color $transition-fast, transform $transition-fast;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: translateY(-1px);
  }
}

.mini-resume__avatar {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%);
}

.paper-line {
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #dbeafe 0%, #e5e7eb 100%);
  margin-bottom: $spacing-2;

  &--xl {
    width: 62%;
    height: 14px;
  }

  &--md {
    width: 42%;
  }

  &--sm {
    width: 58%;
  }
}

.trust-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: $spacing-4;
  margin-bottom: $spacing-16;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.stat-card,
.trust-item,
.feature-card,
.scene-card,
.template-card,
.cta-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.05);
}

.trust-item {
  border-radius: $radius-xl;
  padding: $spacing-5;

  strong {
    display: block;
    margin-bottom: $spacing-2;
    font-size: $font-size-base;
    color: $color-text-primary;
  }

  span {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.7;
  }
}

.feature-section,
.template-section,
.scene-section,
.cta-section {
  margin-bottom: $spacing-16;
}

.section-intro {
  max-width: 760px;
  margin-bottom: $spacing-8;

  span {
    background: rgba($color-primary, 0.08);
    color: $color-primary;
  }

  h2 {
    margin-top: $spacing-4;
    font-size: 2.25rem;
    line-height: 1.2;
    color: $color-text-primary;
  }

  p {
    margin-top: $spacing-4;
    color: $color-text-secondary;
    line-height: 1.8;
  }

  &--center {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }
}

.feature-grid,
.template-grid,
.scene-grid {
  display: grid;
  gap: $spacing-5;
}

.feature-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));

  @media (max-width: 1180px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  border-radius: $radius-2xl;
  padding: $spacing-5;

  &--lane {
    min-height: 144px;
  }

  h3 {
    margin-top: $spacing-4;
    margin-bottom: $spacing-2;
    color: $color-text-primary;
    font-size: $font-size-lg;
  }

  p {
    color: $color-text-secondary;
    line-height: 1.8;
    font-size: $font-size-sm;
  }
}

.feature-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.58);
  color: $color-primary;
  font-weight: $font-weight-semibold;
}

.template-toolbar {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  margin-bottom: $spacing-6;
  justify-content: space-between;
  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
  }

  @media (max-width: 680px) {
    flex-direction: row;
    align-items: center;
    margin-bottom: $spacing-4;
  }
}

.template-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-3;

  @media (max-width: 680px) {
    flex: 1;

    .template-tab {
      display: none;
    }

    h2 {
      font-size: $font-size-lg;
      color: $color-text-primary;
    }
  }
}

.template-tab {
  padding: $spacing-2 $spacing-4;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.72);
  color: $color-text-secondary;
  font-size: $font-size-sm;
  transition: all $transition-fast;

  &:hover {
    border-color: rgba($color-primary, 0.16);
    color: $color-primary;
  }

  &.is-active {
    background: rgba($color-primary, 0.1);
    color: $color-primary;
    border-color: rgba($color-primary, 0.2);
  }
}

.template-more {
  color: $color-text-secondary;
  font-size: $font-size-sm;
}

.template-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 680px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-3;
  }
}

@media (max-width: 680px) {
  .template-card {
    border-radius: 18px;
  }

  .template-preview {
    display: none;
  }

  .template-info {
    padding: $spacing-4;

    p {
      margin-top: $spacing-2;
    }
  }

  .template-tags {
    margin-top: $spacing-3;
  }

  .template-meta {
    margin-top: $spacing-4;
  }
}

.template-card {
  border-radius: 24px;
  overflow: hidden;
  transition: transform $transition-normal, border-color $transition-normal, box-shadow $transition-normal;

  &:hover {
    transform: translateY(-3px);
  }

  &.is-selected {
    border-color: rgba($color-primary, 0.24);
    box-shadow: 0 18px 48px rgba(14, 165, 233, 0.12);
  }
}

.template-preview {
  height: 228px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-5;
}

.mini-resume {
  width: 100%;
  max-width: 260px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 18px;
  padding: $spacing-4;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $spacing-3;
    margin-bottom: $spacing-4;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }

  &__row {
    display: flex;
    gap: $spacing-2;
    margin-bottom: $spacing-4;

    span {
      display: block;
      height: 1.5rem;
      flex: 1;
      border-radius: 999px;
      background: #eef4ff;
    }
  }

  &__section {
    height: 0.75rem;
    border-radius: 999px;
    background: linear-gradient(90deg, #dbeafe 0%, #e5e7eb 100%);
    margin-bottom: $spacing-2;

    &--wide {
      width: 82%;
    }
  }
}

.template-info {
  padding: $spacing-5;

  &__top {
    display: flex;
    justify-content: space-between;
    gap: $spacing-3;
    align-items: center;
    margin-bottom: $spacing-2;
  }

  h3 {
    color: $color-text-primary;
    font-size: $font-size-lg;
  }

  p {
    color: $color-text-secondary;
    line-height: 1.8;
    font-size: $font-size-sm;
  }

  span {
    display: inline-flex;
    padding: $spacing-1 $spacing-2;
    border-radius: 999px;
    background: rgba($color-primary, 0.08);
    color: $color-primary;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
  }
}

.template-tags {
  margin-top: $spacing-4;
}

.template-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;
  margin-top: $spacing-5;

  strong {
    color: $color-text-primary;
    font-size: $font-size-sm;
  }

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.scene-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.scene-card {
  text-align: left;
  border-radius: 24px;
  padding: $spacing-6;
  transition: transform $transition-normal, box-shadow $transition-normal;

  &:hover {
    transform: translateY(-3px);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    gap: $spacing-3;
    margin-bottom: $spacing-4;
    align-items: flex-start;
  }

  h3 {
    color: $color-text-primary;
    margin-top: $spacing-3;
    margin-bottom: $spacing-3;
    font-size: $font-size-xl;
  }

  p {
    color: $color-text-secondary;
    line-height: 1.8;
    font-size: $font-size-sm;
    margin-bottom: $spacing-4;
  }
}

.scene-badge,
.scene-template,
.scene-tags span {
  display: inline-flex;
  padding: $spacing-1 $spacing-2;
  border-radius: 999px;
  font-size: $font-size-xs;
}

.scene-badge {
  background: rgba($color-primary, 0.08);
  color: $color-primary;
}

.scene-template,
.scene-tags span {
  background: #f1f5f9;
  color: $color-text-secondary;
}

.scene-tags {
  display: flex;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.cta-card {
  border-radius: 28px;
  padding: $spacing-8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-8;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
  }

  h2 {
    margin-top: $spacing-4;
    color: $color-text-primary;
    font-size: 2rem;
  }

  p {
    margin-top: $spacing-3;
    color: $color-text-secondary;
    line-height: 1.8;
    max-width: 720px;
  }
}

.cta-eyebrow {
  background: rgba($color-primary, 0.08);
  color: $color-primary;
}
</style>
