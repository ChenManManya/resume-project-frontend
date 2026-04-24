<script setup lang="ts">
import AppTopNav from '~/components/AppTopNav.client.vue'
import ResumeCardNew from '~/components/resume/ResumeCardNew.vue'
import {
  getTemplateCategoryies,
  getTemplateTagsGroup,
  pageTemplates,
  type TemplatePayload,
  type TemplateTagsGroupPayload
} from '~/apis/templatesApi'

interface TemplateCard {
  id: number
  title: string
  summary: string
  tags: string[]
  previewImageUrl?: string
  usageNumber: number
  category: string
}

interface TemplatesPageData {
  categories: string[]
  tagGroups: TemplateTagsGroupPayload
}

type ApiData<T> = T | ApiResult<T> | null | undefined
const ALL_CATEGORY = '全部'

const route = useRoute()
const config = useRuntimeConfig()
const pageSize = 20


const emptyPageResult = (): PageResult<TemplatePayload> => ({
  total: 0,
  pageNum: 1,
  pageSize,
  list: []
})

const unwrapApiData = <T>(value: ApiData<T>) => {
  if (!value) {
    return null
  }

  if (typeof value === 'object' && 'code' in value && 'data' in value) {
    return value.data as T
  }

  return value as T
}

const normalizePage = (value: unknown) => {
  const page = Number(value)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

const joinUrl = (base: string, path: string) => {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return new URL(path.replace(/^\//, ''), normalizedBase).toString()
}

const resolveAssetUrl = (url?: string) => {
  if (!url) {
    return url
  }

  if (/^https?:\/\//.test(url) || url.startsWith('data:')) {
    return url
  }

  const baseURL = typeof config.public.resumeApiBase === 'string' ? config.public.resumeApiBase : ''

  if (!baseURL) {
    return url
  }

  if (baseURL.startsWith('http')) {
    return joinUrl(baseURL, url)
  }

  if (url.startsWith('/')) {
    return `${baseURL.replace(/\/$/, '')}${url}`
  }

  return `${baseURL.replace(/\/$/, '')}/${url}`
}

const normalizeTemplates = (templates: TemplatePayload[] = [], category: string) => {
  return templates.map<TemplateCard>((template) => ({
    id: template.id,
    title: template.name,
    summary: template.description,
    tags: template.tags ?? [],
    previewImageUrl: resolveAssetUrl(template.previewImageUrl),
    usageNumber: template.usageNumaber ?? 0,
    category: template.catgory || category
  }))
}

const taxonomyData = useState<TemplatesPageData>('templates-page-taxonomy', () => ({
  categories: [],
  tagGroups: {}
}))
const taxonomyReady = useState('templates-page-taxonomy-ready', () => false)

const loadTaxonomy = async () => {
  const [categoriesResponse, tagsResponse] = await Promise.all([
    getTemplateCategoryies(),
    getTemplateTagsGroup()
  ])

  const categoriesData = unwrapApiData(categoriesResponse.data.value)
  const tagGroupsData = unwrapApiData(tagsResponse.data.value)

  if (!categoriesData || !tagGroupsData) {
    return
  }

  taxonomyData.value = {
    categories: categoriesData,
    tagGroups: tagGroupsData
  }

  taxonomyReady.value = true
}

const categories = computed(() => taxonomyData.value.categories)
const categoryTabs = computed(() => [ALL_CATEGORY, ...categories.value])
const tagGroups = computed(() => taxonomyData.value.tagGroups)

const selectedCategory = computed(() => {
  const requested = typeof route.query.category === 'string' ? route.query.category : ''

  if (requested === ALL_CATEGORY) {
    return ALL_CATEGORY
  }

  if (requested && categories.value.includes(requested)) {
    return requested
  }

  return ALL_CATEGORY
})

const availableTags = computed(() => {
  if (selectedCategory.value === ALL_CATEGORY) {
    return Array.from(new Set(Object.values(tagGroups.value).flat()))
  }

  return tagGroups.value[selectedCategory.value] ?? []
})

const selectedTag = computed(() => {
  const requested = typeof route.query.tag === 'string' ? route.query.tag : ''
  return availableTags.value.includes(requested) ? requested : ''
})

const keyword = computed(() => typeof route.query.keyword === 'string' ? route.query.keyword : '')
const keywordInput = ref(keyword.value)

const activePage = computed(() => normalizePage(route.query.page))

const featuredTags = computed(() => {
  const unique = new Set<string>()

  for (const tags of Object.values(tagGroups.value)) {
    for (const tag of tags) {
      unique.add(tag)
      if (unique.size >= 8) {
        return Array.from(unique)
      }
    }
  }

  return Array.from(unique)
})

const templatesPage = useState<PageResult<TemplatePayload>>('templates-page-list', emptyPageResult)
const templatesReadyFor = useState('templates-page-list-key', () => '')
const pending = ref(false)
let latestTemplatesRequest = 0

const currentQueryKey = computed(() => JSON.stringify({
  category: selectedCategory.value,
  tag: selectedTag.value,
  keyword: keyword.value,
  page: activePage.value
}))

const loadTemplates = async (queryKey = currentQueryKey.value) => {
  const requestId = ++latestTemplatesRequest
  pending.value = true

  try {
    const response = await pageTemplates({
      pageNum: activePage.value,
      pageSize,
      category: selectedCategory.value === ALL_CATEGORY ? undefined : selectedCategory.value,
      tag: selectedTag.value ? [selectedTag.value] : [],
      keyword: keyword.value || undefined
    })

    if (requestId !== latestTemplatesRequest) {
      return
    }

    const pageData = unwrapApiData(response.data.value)

    if (!pageData) {
      return
    }

    templatesPage.value = pageData
    templatesReadyFor.value = queryKey
  } finally {
    if (requestId === latestTemplatesRequest) {
      pending.value = false
    }
  }
}

if (!taxonomyReady.value) {
  await loadTaxonomy()
}

if (templatesReadyFor.value !== currentQueryKey.value) {
  await loadTemplates(currentQueryKey.value)
}

watch(keyword, (value) => {
  keywordInput.value = value
})

watch([selectedCategory, selectedTag, keyword, activePage], async () => {
  if (templatesReadyFor.value === currentQueryKey.value) {
    return
  }

  await loadTemplates(currentQueryKey.value)
})

const templateCards = computed(() => normalizeTemplates(templatesPage.value.list ?? [], selectedCategory.value))
const totalTemplates = computed(() => templatesPage.value.total ?? 0)
const currentPage = computed(() => templatesPage.value.pageNum ?? activePage.value)
const isResolvedForCurrentQuery = computed(() => templatesReadyFor.value === currentQueryKey.value)


const updateQuery = (updates: Record<string, string | number | undefined>) => {
  const query: Record<string, string> = {}

  for (const [key, value] of Object.entries({ ...route.query, ...updates })) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    query[key] = String(value)
  }

  return navigateTo({
    path: '/templates',
    query
  })
}

const setCategory = (category: string) => {
  void updateQuery({
    category,
    tag: undefined,
    keyword: keyword.value || undefined,
    page: undefined
  })
}

const setTag = (tag: string) => {
  void updateQuery({
    category: selectedCategory.value,
    tag,
    keyword: keyword.value || undefined,
    page: undefined
  })
}

const clearTag = () => {
  void updateQuery({
    category: selectedCategory.value,
    tag: undefined,
    keyword: keyword.value || undefined,
    page: undefined
  })
}

const setFeaturedTag = (tag: string) => {
  const targetCategory = Object.entries(tagGroups.value).find(([, tags]) => tags.includes(tag))?.[0] ?? selectedCategory.value

  void updateQuery({
    category: targetCategory,
    tag,
    keyword: keyword.value || undefined,
    page: undefined
  })
}

const applyKeywordSearch = () => {
  const nextKeyword = keywordInput.value.trim()

  if (keyword.value === nextKeyword) {
    return
  }

  void updateQuery({
    category: selectedCategory.value,
    tag: selectedTag.value || undefined,
    keyword: nextKeyword || undefined,
    page: undefined
  })
}

const clearKeywordSearch = () => {
  keywordInput.value = ''
  void updateQuery({
    category: selectedCategory.value,
    tag: selectedTag.value || undefined,
    keyword: undefined,
    page: undefined
  })
}

const handlePageChange = (page: number) => {
  void updateQuery({
    category: selectedCategory.value,
    tag: selectedTag.value || undefined,
    keyword: keyword.value || undefined,
    page: page > 1 ? page : undefined
  })
}

useHead({
  title: '模板库 - 慢慢简历'

})

useSeoMeta({
  title: '模板库 - 慢慢简历',
  description: '浏览和选择适合你的简历模板，快速创建专业的简历。',
  keywords: '简历模板, 在线简历, 简历设计, 简历制作'
})
</script>

<template>
  <div class="templates-page">
    <AppTopNav />

    <main class="templates-main">
      <n-card  style="margin-bottom: 16px">
        <div class="templates-search-bar">
          <n-input
            v-model:value="keywordInput"
            size="small"
            clearable
            placeholder="搜索模板关键词"
            @keyup.enter="applyKeywordSearch"
            @clear="clearKeywordSearch"
          />
        </div>
        <n-tabs
            type="line"
            :value="selectedCategory"
            @update:value="setCategory"
          >
            <n-tab-pane
              v-for="category in categoryTabs"
              :key="category"
              :name="category"
              :tab="category"
            >
              <div class="template-card-wrapper">
                <button
                class="filters-pill"
                :class="{ 'is-active': !selectedTag }"
                type="button"
                @click="clearTag"
                >
                  全部
                </button>
                <button
                  v-for="tag in availableTags"
                  :key="tag"
                  class="filters-pill"
                  :class="{ 'is-active': selectedTag === tag }"
                  type="button"
                  @click="setTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </n-tab-pane>
          </n-tabs>
       </n-card>

      <section class="gallery-section">
         <div v-if="pending && !isResolvedForCurrentQuery" class="template-grid template-grid--loading">
           <div v-for="item in pageSize" :key="item" class="template-card template-card--loading">
            <n-skeleton height="360px" sharp />
            <div class="template-card__meta-panel">
              <n-skeleton text :repeat="3" />
            </div>
          </div>
        </div>

        <div v-else-if="templateCards.length" class="template-grid">
            <ResumeCardNew
              v-for="template in templateCards"
              :key="template.id"
              :title="template.title"
              :img-url="template.previewImageUrl"
              :tags="template.tags"
              @click="navigateTo(`/templates/${template.id}`)"
            />
        </div>

        <n-empty
          v-else-if="!pending"
          class="templates-empty"
          description="当前筛选下还没有模板，换个分类或标签试试。"
        />

        <div v-if="totalTemplates > pageSize" class="template-pagination">
          <n-pagination
            :page="currentPage"
            :page-size="pageSize"
            :item-count="totalTemplates"
            @update:page="handlePageChange"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.templates-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.13), transparent 24%),
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.08), transparent 22%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.templates-main {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
  padding: 36px 0 72px;
}

.template-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(18px);
}
.filters-pill {
  border-radius: 999px;
  transition: transform $transition-fast, border-color $transition-fast, background-color $transition-fast;
}

.filters-pill {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.8);
  color: #334155;
  padding: 9px 14px;
  font-size: 13px;
  flex: 0 0 auto;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(37, 99, 235, 0.24);
    color: #2563eb;
  }

  &.is-active {
    background: rgba(37, 99, 235, 0.1);
    border-color: rgba(37, 99, 235, 0.22);
    color: #2563eb;
  }
}

.gallery-section {
  margin-top: 28px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.template-grid--loading {
  .template-card--loading {
    pointer-events: none;
  }
}

.template-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-radius: 28px;
  padding: 16px;
  text-decoration: none;
  transition: transform $transition-normal, box-shadow $transition-normal, border-color $transition-normal;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(37, 99, 235, 0.24);
    box-shadow: 0 28px 64px rgba(15, 23, 42, 0.1);
  }
}

.template-card__meta-panel {
  display: grid;
  gap: 12px;

  p {
    margin: 0;
    color: #64748b;
    line-height: 1.8;
    font-size: 14px;
  }
}

.templates-empty,
.template-pagination {
  margin-top: 28px;
}

.template-pagination {
  display: flex;
  justify-content: center;
}

@media (max-width: 1080px) {
  .template-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .templates-main {
    width: min(100%, calc(100% - 24px));
    padding-top: 24px;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }
}


.template-card-wrapper {
  display: flex;
  flex-direction: row;
  padding: 10px 0 0 0;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.templates-search-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;

  :deep(.n-input) {
    width: min(220px, 100%);
  }
}
</style>
