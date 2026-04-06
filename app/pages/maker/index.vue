<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import WangRichTextField from '~/components/maker/WangRichTextField.client.vue'
import ResumeBlockRenderer from '~/components/resume/ResumeBlockRenderer.vue'
import draggable from 'vuedraggable'
import CardType from '~/enums/cardEnum'
import { createDefaultResumeModules } from '~/utils/resumeData'
import { buildResumePrintRoute } from '~/utils/resumePrintRoute'
import type { ResumeCardItem, ResumeModule, ResumePersonalModule, ResumeSectionModule } from '~/types/resume'

type PageBreak = {
  id: string
  pageNumber: number
  top: number
}

const moduleList = ref<ResumeModule[]>(createDefaultResumeModules())
const railCollapsed = ref(false)
const selectedModuleKey = ref<string>('personal')
const expandedKeys = ref<string[]>(['personal'])
const hiddenModuleKeys = ref<string[]>([])
const photoInputRef = ref<HTMLInputElement | null>(null)

const previewRef = ref<HTMLElement | null>(null)
const previewMetrics = ref<{ breaks: PageBreak[] }>({ breaks: [] })
const editorRefs = reactive(new Map<string, HTMLElement>())
let resizeObserver: ResizeObserver | null = null

definePageMeta({
  ssr: false
})

const setEditorRef = (key: string) => (el: Element | null) => {
  if (el instanceof HTMLElement) {
    editorRefs.set(key, el)
  } else {
    editorRefs.delete(key)
  }
}

const visibleModules = computed(() => {
  return moduleList.value.filter((module) => !hiddenModuleKeys.value.includes(module.key))
})

const visibleModuleList = computed<ResumeModule[]>({
  get() {
    return visibleModules.value
  },
  set(reorderedVisibleModules) {
    const hiddenKeys = new Set(hiddenModuleKeys.value)
    const nextModules: ResumeModule[] = []
    let visibleIndex = 0

    moduleList.value.forEach((module) => {
      if (hiddenKeys.has(module.key)) {
        nextModules.push(module)
        return
      }

      nextModules.push(reorderedVisibleModules[visibleIndex])
      visibleIndex += 1
    })

    moduleList.value = nextModules
  }
})

const pageBreaks = computed(() => previewMetrics.value.breaks)

const isExpanded = (key: string) => expandedKeys.value.includes(key)

const ensureExpanded = (key: string) => {
  if (!expandedKeys.value.includes(key)) {
    expandedKeys.value.push(key)
  }
}

const selectModule = async (key: string) => {
  selectedModuleKey.value = key
  ensureExpanded(key)
  await nextTick()
  editorRefs.get(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const toggleExpanded = (key: string) => {
  if (isExpanded(key)) {
    expandedKeys.value = expandedKeys.value.filter((item) => item !== key)
    return
  }

  expandedKeys.value.push(key)
}

const toggleVisibility = (key: string, value: boolean) => {
  if (value) {
    hiddenModuleKeys.value = hiddenModuleKeys.value.filter((item) => item !== key)
    return
  }

  hiddenModuleKeys.value = [...hiddenModuleKeys.value, key]

  if (selectedModuleKey.value === key) {
    const fallback = visibleModules.value.find((module) => module.key !== key)
    if (fallback) {
      selectedModuleKey.value = fallback.key
    }
  }
}

const moveVisibleModule = (moduleKey: string, direction: 'up' | 'down') => {
  const currentModules = [...visibleModuleList.value]
  const index = currentModules.findIndex((module) => module.key === moduleKey)

  if (index === -1) {
    return
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1

  if (targetIndex < 0 || targetIndex >= currentModules.length) {
    return
  }

  const [moved] = currentModules.splice(index, 1)
  currentModules.splice(targetIndex, 0, moved)
  visibleModuleList.value = currentModules
}

const moduleLabel = (module: ResumeModule) => {
  if (module.type === 'personal') {
    return '基本信息'
  }

  return module.title
}

const createCustomModule = () => {
  const moduleKey = `custom-${Date.now()}`

  moduleList.value.push({
    key: moduleKey,
    type: 'section',
    cardType: CardType.CUSTOM,
    title: '自定义模块',
    items: [
      {
        id: Date.now(),
        title: '自定义标题',
        subtitle: '补充信息',
        content: '请填写这个自定义模块的内容。',
        date: '',
        location: ''
      }
    ]
  })

  hiddenModuleKeys.value = hiddenModuleKeys.value.filter((key) => key !== moduleKey)
  selectedModuleKey.value = moduleKey
  ensureExpanded(moduleKey)

  nextTick(() => {
    editorRefs.get(moduleKey)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    updatePreviewMetrics()
  })
}

const applyRichFormat = (command: string, value?: string) => {
  if (!import.meta.client) {
    return
  }

  document.execCommand(command, false, value)
}

const insertRichLink = () => {
  if (!import.meta.client) {
    return
  }

  const url = window.prompt('请输入链接地址')?.trim()

  if (!url) {
    return
  }

  const normalizedUrl = /^https?:\/\//.test(url) ? url : `https://${url}`
  document.execCommand('createLink', false, normalizedUrl)
}

const syncRichContent = (moduleKey: string, itemId: number, html: string) => {
  const module = moduleList.value.find((item): item is ResumeSectionModule => item.key === moduleKey && item.type === 'section')
  if (!module) {
    return
  }

  const target = module.items.find((item) => item.id === itemId)
  if (!target) {
    return
  }

  target.content = html
}

const triggerPhotoUpload = () => {
  photoInputRef.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]

  if (!file) {
    return
  }

  const personalModule = moduleList.value.find((module): module is ResumePersonalModule => module.type === 'personal')
  if (!personalModule) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      personalModule.data.photo = reader.result
    }
  }
  reader.readAsDataURL(file)

  input.value = ''
}

const removeCustomModule = (moduleKey: string) => {
  const target = moduleList.value.find(
    (module): module is ResumeSectionModule => module.key === moduleKey && module.type === 'section'
  )

  if (!target || target.cardType !== CardType.CUSTOM) {
    return
  }

  moduleList.value = moduleList.value.filter((module) => module.key !== moduleKey)
  hiddenModuleKeys.value = hiddenModuleKeys.value.filter((key) => key !== moduleKey)
  expandedKeys.value = expandedKeys.value.filter((key) => key !== moduleKey)

  if (selectedModuleKey.value === moduleKey) {
    selectedModuleKey.value = moduleList.value[0]?.key ?? 'personal'
  }
}

const moduleMeta = (module: ResumeModule) => {
  if (module.type === 'personal') {
    return '头像、姓名、联系方式'
  }

  switch (module.cardType) {
    case CardType.EDUCATION:
      return '学校、专业、学历、时间'
    case CardType.WORK:
      return '公司、岗位、部门、时间'
    case CardType.PROJECT:
      return '角色、地点、链接、成果'
    case CardType.SKILL:
      return '技能亮点与补充说明'
    default:
      return `${module.items.length} 条内容`
  }
}

const addSectionItem = (moduleKey: string) => {
  const module = moduleList.value.find((item): item is ResumeSectionModule => item.key === moduleKey && item.type === 'section')

  if (!module) {
    return
  }

  module.items.push({
    id: Date.now(),
    title: '新条目',
    content: '请填写这一段内容。'
  })
}

const removeSectionItem = (moduleKey: string, itemId: number) => {
  const module = moduleList.value.find((item): item is ResumeSectionModule => item.key === moduleKey && item.type === 'section')

  if (!module) {
    return
  }

  module.items = module.items.filter((item) => item.id !== itemId)
}

const openPrintPage = () => {
  if (!import.meta.client) {
    return
  }

  const route = buildResumePrintRoute(visibleModules.value)
  window.open(route, '_blank', 'noopener,noreferrer')
}

const updatePreviewMetrics = () => {
  const element = previewRef.value
  if (!element) {
    return
  }

  const styles = window.getComputedStyle(element)
  const contentWidth = parseFloat(styles.width)
  const paddingTop = parseFloat(styles.paddingTop)
  const paddingBottom = parseFloat(styles.paddingBottom)
  const pageHeight = (contentWidth * 297) / 210
  const contentPageHeight = pageHeight - paddingTop - paddingBottom
  const blocks = Array.from(element.querySelectorAll<HTMLElement>('.preview-block'))
  const breaks: PageBreak[] = []

  let currentPage = 1
  let currentLimit = contentPageHeight

  blocks.forEach((block) => {
    const blockTop = block.offsetTop - paddingTop
    const blockBottom = blockTop + block.offsetHeight

    if (blockBottom <= currentLimit) {
      return
    }

    currentPage += 1
    currentLimit = contentPageHeight * currentPage
    breaks.push({
      id: `page-break-${currentPage}`,
      pageNumber: currentPage,
      top: block.offsetTop
    })
  })

  previewMetrics.value = { breaks }
}

onMounted(async () => {
  await nextTick()
  updatePreviewMetrics()

  if (!previewRef.value || !import.meta.client) {
    return
  }

  resizeObserver = new ResizeObserver(() => updatePreviewMetrics())
  resizeObserver.observe(previewRef.value)
  window.addEventListener('resize', updatePreviewMetrics)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  if (import.meta.client) {
    window.removeEventListener('resize', updatePreviewMetrics)
  }
})

watch(
  moduleList,
  async () => {
    await nextTick()
    updatePreviewMetrics()
  },
  { deep: true }
)

watch(hiddenModuleKeys, async () => {
  await nextTick()
  updatePreviewMetrics()
})
</script>

<template>
  <div class="maker-workspace">
    <header class="maker-topbar">
      <div>
        <p class="maker-topbar__eyebrow">我的简历</p>
        <h1>简洁专业简历模板工作台</h1>
      </div>
      <div class="maker-topbar__actions">
        <n-button quaternary @click="railCollapsed = !railCollapsed">
          {{ railCollapsed ? '展开板块' : '收起板块' }}
        </n-button>
        <n-button type="primary" @click="openPrintPage">打印版预览</n-button>
      </div>
    </header>

    <div class="maker-shell">
      <aside class="module-rail" :class="{ 'module-rail--collapsed': railCollapsed }">
        <div class="module-rail__header">
          <div>
            <span class="module-rail__eyebrow">模块选择</span>
            <strong v-if="!railCollapsed">显示 / 隐藏</strong>
          </div>
        </div>

        <div class="module-rail__list">
          <div
            v-for="module in moduleList"
            :key="module.key"
            class="module-rail__item"
            :class="{ 'is-active': selectedModuleKey === module.key }"
          >
            <button class="module-rail__select" type="button" @click="selectModule(module.key)">
              <div v-if="!railCollapsed" class="module-rail__item-copy">
                <strong>{{ moduleLabel(module) }}</strong>
                <small>{{ moduleMeta(module) }}</small>
              </div>
              <div v-else class="module-rail__item-dot" />
            </button>
            <div class="module-rail__item-actions" @click.stop>
              <button class="module-rail__order" type="button" @click="moveVisibleModule(module.key, 'up')">↑</button>
              <button class="module-rail__order" type="button" @click="moveVisibleModule(module.key, 'down')">↓</button>
              <n-switch
                size="small"
                :value="!hiddenModuleKeys.includes(module.key)"
                @update:value="(value) => toggleVisibility(module.key, value)"
              />
            </div>
          </div>
        </div>

        <n-button class="module-rail__add" type="primary" tertiary block @click="createCustomModule">
          新增自定义模块
        </n-button>
      </aside>

      <section class="editor-panel">
        <div class="editor-panel__header">
          <div>
            <span class="editor-panel__eyebrow">内容编辑</span>
          </div>
        </div>

        <div class="editor-panel__body">
          <article
            v-for="module in visibleModules"
            :key="module.key"
            :ref="setEditorRef(module.key)"
            class="editor-card"
            :class="{ 'is-active': selectedModuleKey === module.key }"
          >
            <button class="editor-card__summary" type="button" @click="toggleExpanded(module.key); selectedModuleKey = module.key">
              <div>
                <span class="editor-card__eyebrow">{{ module.type === 'personal' ? '基础资料' : '板块内容' }}</span>
                <h3>{{ moduleLabel(module) }}</h3>
              </div>
              <span class="editor-card__chevron">{{ isExpanded(module.key) ? '−' : '+' }}</span>
            </button>

            <div v-if="isExpanded(module.key)" class="editor-card__content">
              <template v-if="module.type === 'personal'">
                <div class="editor-grid editor-grid--three">
                  <label>
                    <span>姓名</span>
                    <n-input v-model:value="module.data.name" />
                  </label>
                  <label>
                    <span>电话</span>
                    <n-input v-model:value="module.data.phone" />
                  </label>
                  <label>
                    <span>邮箱</span>
                    <n-input v-model:value="module.data.email" />
                  </label>
                </div>
                <div class="editor-grid editor-grid--two">
                  <label>
                    <span>职位</span>
                    <n-input v-model:value="module.data.title" />
                  </label>
                  <label>
                    <span>地址</span>
                    <n-input v-model:value="module.data.address" />
                  </label>
                </div>
                <div class="editor-grid editor-grid--two">
                  <label>
                    <span>头像地址</span>
                    <n-input v-model:value="module.data.photo" placeholder="可直接粘贴图片 URL" />
                  </label>
                  <div class="photo-editor">
                    <span>头像操作</span>
                    <div class="photo-editor__actions">
                      <n-button secondary @click="triggerPhotoUpload">上传替换</n-button>
                      <n-button quaternary @click="module.data.photo = ''">清空头像</n-button>
                    </div>
                    <input ref="photoInputRef" class="photo-editor__input" type="file" accept="image/*" @change="handlePhotoUpload" />
                  </div>
                </div>
              </template>

              <template v-else>
                <label class="editor-card__title-field">
                  <span>板块标题</span>
                  <n-input v-model:value="module.title" />
                </label>

                <div v-if="module.cardType === CardType.CUSTOM" class="editor-card__custom-actions">
                  <n-button text type="error" @click="removeCustomModule(module.key)">删除这个自定义模块</n-button>
                </div>

                <div class="section-item-list">
                  <div v-for="item in module.items" :key="item.id" class="section-item-editor">
                    <div class="section-item-editor__toolbar">
                      <strong>{{ item.title || '未命名条目' }}</strong>
                      <n-button text type="error" @click="removeSectionItem(module.key, item.id)">删除</n-button>
                    </div>

                    <div class="editor-grid editor-grid--two">
                      <label>
                        <span>标题</span>
                        <n-input v-model:value="item.title" />
                      </label>
                      <label v-if="module.cardType === CardType.WORK">
                        <span>岗位</span>
                        <n-input v-model:value="item.pos" />
                      </label>
                      <label v-else-if="module.cardType === CardType.PROJECT">
                        <span>角色</span>
                        <n-input v-model:value="item.role" />
                      </label>
                      <label v-else-if="module.cardType !== CardType.EDUCATION && module.cardType !== CardType.SKILL && module.title !== '自我介绍'">
                        <span>副标题</span>
                        <n-input v-model:value="item.subtitle" />
                      </label>
                    </div>

                    <div class="editor-grid editor-grid--three" v-if="module.cardType !== CardType.SKILL && module.title !== '自我介绍'">
                      <label v-if="module.cardType === CardType.EDUCATION">
                        <span>专业</span>
                        <n-input v-model:value="item.major" />
                      </label>
                      <label v-if="module.cardType === CardType.EDUCATION">
                        <span>学历</span>
                        <n-input v-model:value="item.degree" />
                      </label>
                      <label v-if="module.cardType === CardType.WORK">
                        <span>部门</span>
                        <n-input v-model:value="item.dept" />
                      </label>
                      <label v-if="module.cardType !== CardType.SKILL">
                        <span>时间</span>
                        <n-input v-model:value="item.date" />
                      </label>
                      <label v-if="module.cardType !== CardType.SKILL">
                        <span>地点</span>
                        <n-input v-model:value="item.location" />
                      </label>
                      <label v-if="module.cardType === CardType.PROJECT">
                        <span>项目链接</span>
                        <n-input v-model:value="item.projectLink" />
                      </label>
                    </div>

                    <label v-if="module.cardType === CardType.EDUCATION">
                      <span>学习形式</span>
                      <n-input v-model:value="item.learnMethod" />
                    </label>

                    <div class="editor-field editor-field--rich">
                      <span>内容描述</span>
                      <WangRichTextField v-model="item.content" />
                    </div>
                  </div>
                </div>

                <n-button dashed block @click="addSectionItem(module.key)">新增条目</n-button>
              </template>
            </div>
          </article>
        </div>
      </section>

      <section class="preview-panel">
        <div class="preview-panel__toolbar">
          <div>
            <span class="preview-panel__eyebrow">实时预览</span>
          </div>
        </div>

        <div class="preview-canvas">
          <div ref="previewRef" class="preview-paper">
            <div
              v-for="item in pageBreaks"
              :key="item.id"
              class="page-break-indicator"
              :style="{ top: `${item.top}px` }"
            >
              <span>第 {{ item.pageNumber }} 页</span>
            </div>

            <draggable
              v-model="visibleModuleList"
              item-key="key"
              animation="200"
              ghost-class="preview-ghost"
              class="preview-block-list"
            >
              <template #item="{ element: module }">
                <button
                  class="preview-block"
                  :class="{ 'is-active': selectedModuleKey === module.key }"
                  type="button"
                  @click="selectModule(module.key)"
                >
                  <ResumeBlockRenderer :module="module" />
                </button>
              </template>
            </draggable>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.maker-workspace {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #f7f8fc 0%, #eef2ff 100%);
}

.maker-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  h1 {
    margin: 4px 0 0;
    font-size: 24px;
    color: #111827;
  }
}

.maker-topbar__eyebrow,
.module-rail__eyebrow,
.editor-panel__eyebrow,
.preview-panel__eyebrow,
.editor-card__eyebrow {
  font-size: 12px;
  color: #64748b;
  letter-spacing: 0.04em;
}

.maker-topbar__actions {
  display: flex;
  gap: 12px;
}

.maker-shell {
  display: grid;
  grid-template-columns: auto minmax(360px, 1fr) minmax(420px, 0.95fr);
  gap: 20px;
  align-items: start;
}

.module-rail,
.editor-panel,
.preview-panel {
  min-height: calc(100vh - 110px);
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
}

.module-rail {
  width: 240px;
  padding: 18px 14px;
  border-radius: 24px;
  transition: width 0.25s ease, padding 0.25s ease;

  &--collapsed {
    width: 88px;
    padding-inline: 10px;

    .module-rail__header {
      text-align: center;
    }

    .module-rail__item {
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 10px 8px;
    }

    .module-rail__select {
      justify-content: center;
      width: 100%;
    }

    .module-rail__item-actions {
      flex-direction: column;
      width: 100%;
      justify-content: center;
    }

    .module-rail__order {
      width: 100%;
      border-radius: 10px;
    }

    .module-rail__add {
      padding-inline: 0;
      font-size: 12px;
    }
  }
}

.module-rail__header {
  margin-bottom: 14px;

  strong {
    display: block;
    margin-top: 4px;
    color: #111827;
  }
}

.module-rail__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.module-rail__add {
  border-radius: 14px;
}

.module-rail__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #fff;
  text-align: left;

  &.is-active {
    border-color: rgba(37, 99, 235, 0.24);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.1);
  }
}

.module-rail__select {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: transparent;
  text-align: left;
}

.module-rail__item-copy {
  min-width: 0;

  strong,
  small {
    display: block;
  }

  strong {
    color: #0f172a;
    font-size: 14px;
  }

  small {
    margin-top: 3px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.4;
  }
}

.module-rail__item-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #2563eb;
  margin-inline: auto;
}

.module-rail__item-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.module-rail__order {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: #fff;
  color: #475569;
  font-size: 12px;
  line-height: 1;
}

.editor-panel,
.preview-panel {
  border-radius: 28px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.editor-panel__header,
.preview-panel__toolbar {
  margin-bottom: 18px;

  h2 {
    margin: 4px 0 0;
    font-size: 18px;
    line-height: 1.4;
    color: #111827;
  }
}

.editor-panel__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.editor-card {
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 20px;
  background: #fff;
  overflow: hidden;

  &.is-active {
    border-color: rgba(37, 99, 235, 0.28);
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.1);
  }
}

.editor-card__summary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  text-align: left;
}

.editor-card__summary h3 {
  margin: 4px 0 0;
  font-size: 17px;
  color: #111827;
}

.editor-card__chevron {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  font-size: 18px;
}

.editor-card__content {
  padding: 0 20px 20px;
}

.editor-grid {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;

  &--three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  &--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;

  > span {
    font-size: 13px;
    color: #475569;
  }
}

.editor-field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  > span {
    font-size: 13px;
    color: #475569;
  }
}

.editor-card__title-field {
  margin-bottom: 14px;
}

.photo-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;

  > span {
    font-size: 13px;
    color: #475569;
  }
}

.photo-editor__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.photo-editor__input {
  display: none;
}

.editor-card__custom-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.section-item-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 14px;
}

.section-item-editor {
  padding: 16px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.95);
}


.section-item-editor__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  strong {
    color: #0f172a;
    font-size: 14px;
  }
}

.preview-canvas {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 6px;
}

.preview-paper {
  position: relative;
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 10mm;
  background: #fff;
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.08);
}

.preview-block-list {
  display: flex;
  flex-direction: column;
}

.preview-block {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 6px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  & + .preview-block {
    margin-top: 14px;
  }

  &.is-active {
    border-color: rgba(37, 99, 235, 0.24);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
}

.preview-ghost {
  opacity: 0.45;
}

.page-break-indicator {
  position: absolute;
  left: -24px;
  right: -24px;
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: none;
  z-index: 2;

  &::before,
  &::after {
    content: '';
    height: 1px;
    flex: 1;
    background: linear-gradient(90deg, rgba(37, 99, 235, 0.12), rgba(37, 99, 235, 0.5), rgba(37, 99, 235, 0.12));
  }

  > span {
    flex-shrink: 0;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(239, 246, 255, 0.96);
    border: 1px solid rgba(37, 99, 235, 0.18);
    color: #2563eb;
    font-size: 12px;
    font-weight: 600;
  }
}

@media (max-width: 1400px) {
  .maker-shell {
    grid-template-columns: auto minmax(340px, 1fr);
  }

  .preview-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .maker-workspace {
    padding: 16px;
  }

  .maker-topbar,
  .maker-shell {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .maker-topbar {
    align-items: flex-start;
  }

  .maker-shell {
    display: flex;
    flex-direction: column;
  }

  .module-rail,
  .module-rail--collapsed {
    width: 100%;
  }

  .editor-grid--three,
  .editor-grid--two {
    grid-template-columns: 1fr;
  }

  .preview-paper {
    width: 100%;
    min-height: auto;
  }
}
</style>
