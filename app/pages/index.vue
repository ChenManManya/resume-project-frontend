<script setup lang="ts">
import AppTopNav from '~/components/AppTopNav.client.vue'
import { computed, ref, watchEffect } from 'vue'
import { type TemplatePayload, type TemplateTagsGroupPayload, getTemplateTagsGroup, pageTemplates } from '~/apis/templatesApi'

interface Stair {
  id: string
  label: string
}


interface TemplateCard {
  id: number
  title: string
  summary: string
  accent: string
  badge: string
  tags: string[]
  previewImageUrl?: string
}

interface PagePayload<T> {
  list: T[]
  total: number
}

const categories: Stair[] = [
  { id: 'hot', label: '热门模板' },
  { id: 'common', label: '通用模板' }
]

const quickFilters = ['Java', '前端开发', '实习', '校招', '后端开发', '产品经理']


const activeCategory = ref<string>('hot')
const searchKeyword = ref('')
const hotActiveTag = ref('')
const commonActiveTag = ref('')
const hotTagInitialized = ref(false)
const commonTagInitialized = ref(false)
const pageSize = 6

const normalizeTemplates = (templates: TemplatePayload[], badge: string, accent: string) => {
  return templates.map<TemplateCard>((template) => ({
    id: template.id,
    title: template.name,
    summary: template.description,
    accent,
    badge,
    tags: template.tags ?? [],
    previewImageUrl: template.previewImageUrl
  }))
}

const tagsGroupData: any = ref([]);


const getTagsGroupData = async () => {
  const {data, error } = await getTemplateTagsGroup()
  tagsGroupData.value = data.value
  console.log(tagsGroupData)
}



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



watchEffect(() => {
  const value = tagsGroupData.value

  if (!value) {
    return
  }

  if (!hotTagInitialized.value) {
    hotActiveTag.value = value['热门']?.[0] ?? ''
    hotTagInitialized.value = true
  }

  if (!commonTagInitialized.value) {
    commonActiveTag.value = value['通用']?.[0] ?? ''
    commonTagInitialized.value = true
  }
})



const hotTemplatesData = ref<PagePayload<TemplateCard>>({ list: [], total: 0 })
const commonTemplatesData = ref<PagePayload<TemplateCard>>({ list: [], total: 0 })

const fetchHotTemplatesData = async () => {
  const {data,error} = await pageTemplates({
    pageSize,
    pageNum: 1,
    category: '热门',
    tag: hotActiveTag.value ? [hotActiveTag.value] : []
  })
  const page: any = data.value ?? { list: [], total: 0 }
  hotTemplatesData.value = {
    list: normalizeTemplates(page.list ?? [], '热门', 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)'),
    total: page.total ?? 0
  }
}

const fetchCommonTemplatesData = async () => {
  const {data, error} = await pageTemplates({
    pageSize,
    pageNum: 1,
    category: '通用',
    tag: commonActiveTag.value ? [commonActiveTag.value] : []
  })

  const page:any = data.value ?? { list: [], total: 0 }
  commonTemplatesData.value = {
    list: normalizeTemplates(page.list ?? [], '通用', 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)'),
    total: page.total ?? 0
  }
}

watchEffect(() => {
  void fetchHotTemplatesData()
})

watchEffect(() => {
  void fetchCommonTemplatesData()
})


const filterByKeyword = (templates: TemplateCard[] = []) => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return templates
  }

  return templates.filter((template) => {
    const title = template.title.toLowerCase()
    const summary = template.summary.toLowerCase()
    const tags = template.tags.join(' ').toLowerCase()

    return title.includes(keyword) || summary.includes(keyword) || tags.includes(keyword)
  })
}

const hotTemplates = computed(() => filterByKeyword(hotTemplatesData.value?.list ?? []))
const commonTemplates = computed(() => filterByKeyword(commonTemplatesData.value?.list ?? []))
const setHotTag = (tag: string) => {
  hotActiveTag.value = tag
}

const setCommonTag = (tag: string) => {
  commonActiveTag.value = tag
}

const goTemplatesSearch = async () => {
  const keyword = searchKeyword.value.trim()

  await navigateTo({
    path: '/templates',
    query: keyword ? { keyword } : undefined
  })
}

onMounted(()=>{
  getTagsGroupData()
  fetchCommonTemplatesData()
  fetchHotTemplatesData()
})
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
              <n-input
                v-model:value="searchKeyword"
                placeholder="搜索你想投递的岗位、风格或模板关键词"
                round
                @keyup.enter="goTemplatesSearch"
              />
              <n-button class="hero-search-btn" type="primary" round @click="goTemplatesSearch">免费制作</n-button>
          </div>

        </div>
      </section>


      <section class="template-section" id="hot">
        <div class="template-toolbar">
          <div class="template-tabs">
            <h2 @click="setHotTag('')">热门简历模板</h2>
            <button
              v-for="tag in (tagsGroupData?.['热门'] ?? [])"
              :key="tag"
              class="template-tab"
              :class="{ 'is-active': hotActiveTag === tag }"
              type="button"
              @click="setHotTag(tag)"
            >
              {{ tag }}
            </button>
          </div>

          <NuxtLink to="/templates">更多模板</NuxtLink>
        </div>

        <div class="template-grid">

          <ResumeCardNew 
            v-for="template in hotTemplates" 
            :key="template.id" 
            :title="template.title"
            :imgUrl="template.previewImageUrl"
            :tags="template.tags"
            @click="navigateTo(`/templates/${template.id}`)" />
        </div>

      </section>

     
      <section class="template-section" id="common">
        <div class="template-toolbar">
          
          <div class="template-tabs">
            <h2 @click="setCommonTag('')">通用简历模板</h2>
            <button
              v-for="tag in (tagsGroupData?.['通用'] ?? [])"
              :key="tag"
              class="template-tab"
              :class="{ 'is-active': commonActiveTag === tag }"
              type="button"
              @click="setCommonTag(tag)"
            >
              {{ tag }}
            </button>
          </div>

             <NuxtLink to="/templates">更多模板</NuxtLink>
        </div>

        <div class="template-grid">
          <ResumeCardNew 
            v-for="template in commonTemplates" 
            :key="template.id" 
            :title="template.title"
            :imgUrl="template.previewImageUrl"
            :tags="template.tags"
            @click="navigateTo(`/templates/${template.id}`)" />
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
  gap: $spacing-6;
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
  grid-template-columns: repeat(4, minmax(0, 1fr));

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

  .template-card__overlay {
    display: none;
  }

  .template-info {
    padding: $spacing-4;
  }

  .template-tags {
    margin-top: $spacing-3;
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

  &:hover {
    .template-card__overlay {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.template-preview {
  position: relative;
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%);
}

.template-preview__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.template-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.48) 100%);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity $transition-fast, transform $transition-fast;
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

  h3 {
    color: $color-text-primary;
    font-size: $font-size-lg;
  }
}

.template-tags {
  margin-top: $spacing-3;

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

.template-use-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  color: #fff;
  background: #2563eb;
  font-size: 13px;
  font-weight: 600;
}

.template-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;

  span {
    color: $color-text-secondary;
    font-size: $font-size-sm;
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
