<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import WangRichTextField from '~/components/maker/WangRichTextField.client.vue'
import ResumeBlockRenderer from '~/components/resume/ResumeBlockRenderer.vue'
import draggable from 'vuedraggable'
import CardType from '~/enums/cardEnum'
import { createDefaultResumeLayout, createDefaultResumeModules } from '~/utils/resumeData'
import { createResume, exportResumePdf, exportResumePng, getResumeDetail, saveResumeDraft, uploadPhoto, type ResumeDetailPayload } from '~/apis/resumeApi'
import type { ResumeLayoutConfig, ResumeModule, ResumePersonalModule, ResumeSectionModule } from '~/types/resume'
import type { UploadCustomRequestOptions, UploadFileInfo } from 'naive-ui'
type PageBreak = {
  id: string
  pageNumber: number
  top: number
}
const isEditingTitle = ref(false)
const moduleList = ref<ResumeModule[]>(createDefaultResumeModules())
const railCollapsed = ref(false)
const selectedModuleKey = ref<string>('personal')
const expandedKeys = ref<string[]>(['personal'])
const hiddenModuleKeys = ref<string[]>([])
const photoInputRef = ref<HTMLInputElement | null>(null)
const layoutConfig = ref<ResumeLayoutConfig>(createDefaultResumeLayout())
const resumeId = ref<number | null>(null)
const currentVersionId = ref<number | null>(null)
const resumeTitle = ref('未命名简历')
const templateId = ref(1)
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const exportState = ref<'idle' | 'exporting'>('idle')
const photofileList = ref<any[]>([])
const fontFamylys = ref([{label:'宋体', value: 'STFangsong'}, {label:'黑体', value: 'STXihei'}, {label:'楷体', value: 'STKaiti'}, {label:'思源黑体', value: '"Noto Sans SC", sans-serif'}])
const { $message } = useNuxtApp()
const fontSize = ref(Array.from({ length: 20 - 12 + 1 }, (_, i) => ({ 
  label: `${i + 12}`, 
  value: `${i + 12}` 
})))

const titleFontSize = ref(Array.from({ length: 36 - 18 + 1 }, (_, i) => ({ 
  label: `${i + 18}`, 
  value: `${i + 18}` 
})))


const lineHeight = Array.from({ length: 11 }, (_, i) => {
  const val = 1.2 + i * 0.1
  return {
    label: val.toFixed(1),        // 避免浮点数精度问题
    value: val.toFixed(1)
  }
})

const showPredefinedPopover = ref(false)
const handlePredefinedUpdateShow = (show: boolean) => {

}

const showGapPopover = ref(false)
const handleGapUpdateShow = (show: boolean) => {

}
const isBootstrapping = ref(true)
let saveTimer: ReturnType<typeof setTimeout> | null = null
const exportOptions = [
  { label: '导出 PDF', key: 'pdf' },
]
const templateOptions = [
  { label: '简约经典', value: 'simple' },
  { label: '双栏布局', value: 'two-column' },
  { label: '卡片风格', value: 'card-style' }
]
const colorPalette = ['#2563eb', '#0f766e', '#7c3aed', '#dc2626', '#ea580c', '#111827']
const layoutPresets = [
  {
    key: 'compact',
    label: '紧凑型',
    config: {
      titleSize: 22,
      bodySize: 12,
      lineHeight: 1.5,
      sectionGap: 16,
      primaryColor: '#2563eb'
    }
  },
  {
    key: 'balanced',
    label: '标准型',
    config: {
      titleSize: 24,
      bodySize: 13,
      lineHeight: 1.7,
      sectionGap: 20,
      primaryColor: '#2563eb'
    }
  },
  {
    key: 'spacious',
    label: '舒展型',
    config: {
      titleSize: 26,
      bodySize: 14,
      lineHeight: 1.9,
      sectionGap: 24,
      primaryColor: '#0f766e'
    }
  }
]

const titleInputRef = ref<HTMLInputElement | null>(null)
const startEditTitle = async () => {
  isEditingTitle.value = true

  await nextTick()
  titleInputRef.value?.focus()
  titleInputRef.value?.select()
}

const finishEditTitle = () => {
  isEditingTitle.value = false
}

const previewRef = ref<HTMLElement | null>(null)
const previewMetrics = ref<{ breaks: PageBreak[] }>({ breaks: [] })
const editorRefs = reactive(new Map<string, HTMLElement>())
let resizeObserver: ResizeObserver | null = null
let previewAssetLoadHandler: (() => void) | null = null
const route = useRoute()

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

const previewPaperStyle = computed(() => ({
  '--resume-font-family': layoutConfig.value.theme.fontFamily,
  '--resume-title-size': `${layoutConfig.value.theme.titleSize}px`,
  '--resume-body-size': `${layoutConfig.value.theme.bodySize}px`,
  '--resume-line-height': String(layoutConfig.value.theme.lineHeight),
  '--resume-primary-color': layoutConfig.value.theme.primaryColor,
  '--resume-section-gap': `${layoutConfig.value.theme.sectionGap}px`,
  '--resume-page-margin': layoutConfig.value.page.margin
}))

const applyLayoutPreset = (presetKey: string) => {
  const preset = layoutPresets.find((item) => item.key === presetKey)

  if (!preset) {
    return
  }

  layoutConfig.value = {
    ...layoutConfig.value,
    theme: {
      ...layoutConfig.value.theme,
      ...preset.config
    }
  }
}

const setPrimaryColor = (color: string) => {
  layoutConfig.value = {
    ...layoutConfig.value,
    theme: {
      ...layoutConfig.value.theme,
      primaryColor: color
    }
  }
}

const isExpanded = (key: string) => expandedKeys.value.includes(key)

const setExpandedKey = (key: string | null) => {
  expandedKeys.value = key ? [key] : []
}

const ensureExpanded = (key: string) => {
  setExpandedKey(key)
}

const selectModule = async (key: string) => {
  selectedModuleKey.value = key
  ensureExpanded(key)
  await nextTick()
  editorRefs.get(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const toggleExpanded = (key: string) => {
  if (isExpanded(key)) {
    setExpandedKey(null)
    return
  }

  setExpandedKey(key)
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

  if (expandedKeys.value.includes(moduleKey)) {
    setExpandedKey(selectedModuleKey.value)
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

const applyResumePayload = (payload: ResumeDetailPayload) => {
  payload = payload.data.value
  resumeId.value = payload.resumeId
  currentVersionId.value = payload.currentVersionId
  resumeTitle.value = payload.title
  templateId.value = payload.templateId
  moduleList.value = payload.contentJson.modules
  layoutConfig.value = payload.layoutJson
  hiddenModuleKeys.value = payload.layoutJson.hiddenModuleKeys ?? []
  photofileList.value = [{
    id: 'avatar-' + resumeId.value, 
    name: resumeTitle.value, 
    url: payload.contentJson.modules.find(m => m.type === 'personal')?.data.photo ?? '',
    status: 'finished'
  }]
  const order = payload.layoutJson.moduleOrder ?? []
  if (order.length > 0) {
    const orderMap = new Map(order.map((key, index) => [key, index]))
    moduleList.value = [...moduleList.value].sort((a, b) => {
      const aIndex = orderMap.get(a.key) ?? Number.MAX_SAFE_INTEGER
      const bIndex = orderMap.get(b.key) ?? Number.MAX_SAFE_INTEGER
      return aIndex - bIndex
    })
  }

  const firstVisible = moduleList.value.find((module) => !hiddenModuleKeys.value.includes(module.key))
  selectedModuleKey.value = firstVisible?.key ?? 'personal'
}

const LoadResume = async () => {
  const queryResumeId = Number(route.query.resumeId)
  const detail: any = await getResumeDetail(queryResumeId)
  applyResumePayload(detail)
}

const persistDraft = async () => {
  if (!resumeId.value) {
    return
  }

  saveState.value = 'saving'

  try {
    const saved:any = await saveResumeDraft(resumeId.value, {
      title: resumeTitle.value,
      templateId: templateId.value,
      contentJson: {
        modules: moduleList.value
      },
      layoutJson: {
        ...layoutConfig.value,
        moduleOrder: moduleList.value.map((module) => module.key),
        hiddenModuleKeys: hiddenModuleKeys.value
      }
    })

    currentVersionId.value = saved.currentVersionId
    saveState.value = 'saved'
  } catch {
    saveState.value = 'error'
  }
}

const handleExport = async (key: string) => {
  if (!resumeId.value) {
    return
  }

  if (exportState.value === 'exporting') {
    return
  }

  exportState.value = 'exporting'
  const loadingMessage = $message.loading('正在导出并下载 PDF，请稍候...', {
    duration: 0
  })

  try {
    if (key === 'pdf') {
      await exportResumePdf(resumeId.value, `${resumeTitle.value}.pdf`)
      $message.success('PDF 已开始下载')
      return
    }
  } catch {
    $message.error('PDF 导出失败，请稍后重试')
  } finally {
    loadingMessage.destroy()
    exportState.value = 'idle'
  }
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
    const blockTop = block.offsetTop
    const blockBottom = blockTop + block.offsetHeight

    while (blockBottom > currentLimit) {
      currentPage += 1
      breaks.push({
        id: `page-break-${currentPage}`,
        pageNumber: currentPage,
        top: currentLimit
      })
      currentLimit = contentPageHeight * currentPage
    }
  })

  previewMetrics.value = { breaks }
}

const schedulePreviewMetricsUpdate = async () => {
  await nextTick()

  if (!import.meta.client) {
    updatePreviewMetrics()
    return
  }

  requestAnimationFrame(() => {
    updatePreviewMetrics()
  })
}
const beforeUpload = async (
  data:{
      file: UploadFileInfo,
      fileList: UploadFileInfo[]
  }
) => {
  const allowedFileType = ['image/jpg','image/png','image/jpeg']
  if (allowedFileType.findIndex(ele => data.file.file?.type == ele) == -1) {
    $message.error('只能上传jpg/png格式的图片文件，请重新上传')
    return false
  }
  photofileList.value.splice(0, photofileList.value.length, )
  return true
}

const handleCustomUpload = async ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
  try {
    const rawFile = file.file as File;
    const {data,error} = await uploadPhoto(rawFile);
    const photoUrl = `${fetchConfig.baseURL}${data.value}`
    file.url = photoUrl;
    visibleModules.value[0].data.photo = photoUrl
    onFinish()
  } catch (err) {
    $message.error('照片上传失败，请重试')
    onError()
  }
}

const handleUploadFinish = ({ file }: { file: UploadFileInfo }) => {
  console.log('handleUploadFinish photofileList', photofileList.value)
    visibleModules.value[0].data.photo = file.url || visibleModules.value[0].data.photo
}

onMounted(async () => {
  try {
    await LoadResume()
    console.log(photofileList.value)
    isBootstrapping.value = false
    await schedulePreviewMetricsUpdate()

    if (!previewRef.value || !import.meta.client) {
      return
    }

    if (typeof ResizeObserver === 'undefined') {
      console.warn('当前浏览器不支持 ResizeObserver，预览尺寸自适应将失效')
      return
    }

    resizeObserver = new ResizeObserver(() => updatePreviewMetrics())
    resizeObserver.observe(previewRef.value)
    window.addEventListener('resize', updatePreviewMetrics)
    previewAssetLoadHandler = () => {
      void schedulePreviewMetricsUpdate()
    }
    previewRef.value.addEventListener('load', previewAssetLoadHandler, true)
  } catch (error) {
    console.error('maker 页面初始化出错:', error)
  }
})

onBeforeUnmount(() => {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }

  resizeObserver?.disconnect()
  resizeObserver = null

  if (import.meta.client) {
    window.removeEventListener('resize', updatePreviewMetrics)
  }

  if (previewRef.value && previewAssetLoadHandler) {
    previewRef.value.removeEventListener('load', previewAssetLoadHandler, true)
  }

  previewAssetLoadHandler = null
})

watch(
  moduleList,
  async () => {
    await schedulePreviewMetricsUpdate()
  },
  { deep: true }
)

watch(hiddenModuleKeys, async () => {
  await schedulePreviewMetricsUpdate()
})

watch(layoutConfig, async () => {
  await schedulePreviewMetricsUpdate()
}, { deep: true })

watch(
  [moduleList, layoutConfig, hiddenModuleKeys, resumeTitle],
  () => {
    if (isBootstrapping.value || !resumeId.value) {
      return
    }

    if (saveTimer) {
      clearTimeout(saveTimer)
    }

    saveTimer = setTimeout(() => {
      void persistDraft()
    }, 800)
  },
  { deep: true }
)
</script>

<template>
  <div class="maker-workspace">
    <header class="maker-topbar">
      <div class="maker-topbar_left">
        <div class="maker-topbar_left-back" @click="navigateTo({path: '/personal'})">
          <n-icon size="24">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M16.62 2.99a1.25 1.25 0 0 0-1.77 0L6.54 11.3a.996.996 0 0 0 0 1.41l8.31 8.31c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.38 12l7.25-7.25c.48-.48.48-1.28-.01-1.76z" fill="currentColor"></path></svg>
          </n-icon>
          我的简历
        </div>
        <div class="maker-topbar_left-title">
          <div
            v-if="!isEditingTitle"
            class="maker-topbar_title"
            @click="startEditTitle"
          >
            <span>{{ resumeTitle }}</span>

            <n-icon size="18">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M15 16l-4 4h10v-4zm-2.94-8.81L3 16.25V20h3.75l9.06-9.06l-3.75-3.75zM5.92 18H5v-.92l7.06-7.06l.92.92L5.92 18zm12.79-9.96a.996.996 0 0 0 0-1.41l-2.34-2.34a1.001 1.001 0 0 0-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"
                  fill="currentColor"
                />
              </svg>
            </n-icon>
          </div>

          <input
            v-else
            ref="titleInputRef"
            v-model="resumeTitle"
            class="maker-topbar_title-input"
            @blur="finishEditTitle"
            @keyup.enter="finishEditTitle"
          />
        </div>
      </div>
      <div class="maker-topbar__actions">
        <span class="maker-save-state" :class="`is-${saveState}`">
          {{ saveState === 'saving' ? '保存中...' : saveState === 'saved' ? '已保存' : saveState === 'error' ? '保存失败' : '未保存' }}
        </span>
        <n-button quaternary @click="railCollapsed = !railCollapsed">
          {{ railCollapsed ? '展开板块' : '收起板块' }}
        </n-button>
        <n-dropdown trigger="click" :options="exportOptions" :disabled="exportState === 'exporting'" @select="handleExport">
          <n-button type="primary" :loading="exportState === 'exporting'">导出</n-button>
        </n-dropdown>
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
                <div class="editor-photo-upload">
                   <span>照片</span>
                    <n-upload
                      @before-upload="beforeUpload"
                      :custom-request="handleCustomUpload"
                      @finish="handleUploadFinish"
                      list-type="image-card"
                      v-model:file-list="photofileList"
                      :max="1"       
                    >
                    <div v-if="!photofileList.length" class="upload-placeholder">
                      <span>上传照片</span>
                    </div>
                  </n-upload>
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
          <div class="preview-panel__heading">
            <span class="preview-panel__eyebrow">实时预览</span>
            <h2>模板排版</h2>
          </div>
          <div class="preview-layout-toolbar">
            <n-popover
              :show="showPredefinedPopover"
              placement="left"
              trigger="manual"
              @update:show="handlePredefinedUpdateShow"
            >
              <template #trigger>
                <n-button dashed @click="showPredefinedPopover = !showPredefinedPopover">预设</n-button>
              </template>
              <template #default>
                <div class="preset-chip">
                  <n-button
                    v-for="preset in layoutPresets"
                    :key="preset.key"
                    @click="applyLayoutPreset(preset.key)"
                  >
                    {{ preset.label }}
                  </n-button>
                </div>
              </template>
            </n-popover>
            <n-popover
              :show="showGapPopover"
              placement="bottom"
              trigger="manual"
              @update:show="handleGapUpdateShow"
            >
              <template #trigger>
                <n-button dashed @click="showGapPopover = !showGapPopover">间距配置</n-button>
              </template>
              <template #default>
                  <div style="width: 150px;">模块间距<n-slider v-model:value="layoutConfig.theme.sectionGap" :step="1" :min="8" :max="40" /></div>
                  <!-- <div style="width: 150px;">页边距<n-slider v-model:value="layoutConfig.page.margin" :step="1" :min="8" :max="40" /></div> -->
              </template>
            </n-popover>
            <n-tooltip trigger="hover">
              <template #trigger>
                 <n-select v-model:value="layoutConfig.theme.templateCode" :options="templateOptions" />
              </template>
              模板样式
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                 <n-select v-model:value="layoutConfig.theme.fontFamily" :options="fontFamylys" />
              </template>
              字体
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                 <n-select v-model:value="layoutConfig.theme.bodySize" :options="fontSize" />
              </template>
              字号
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                 <n-select v-model:value="layoutConfig.theme.titleSize" :options="titleFontSize" />
              </template>
              标题字号
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                 <n-select v-model:value="layoutConfig.theme.lineHeight" :options="lineHeight" />
              </template>
              行高
            </n-tooltip>

            <n-color-picker v-model:value="layoutConfig.theme.primaryColor" :show-preview="true" :swatches="colorPalette">
                <template #trigger="{ value, onClick, ref: triggerRef }">
                  <span
                    :ref="triggerRef"
                    @click="onClick"
                    style="display: inline-block; line-height: 0;"
                  >
                    <n-button dashed title="主题色">
                      <div :style="{ height: '20px', width: '20px', backgroundColor: value }"></div>
                    </n-button>
                  </span>
                </template>
             </n-color-picker>
          </div>
        </div>

        <div class="preview-canvas">
          <div ref="previewRef" class="preview-paper" :style="previewPaperStyle">
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
              :class="{ 'preview-block-list--two-column': layoutConfig.theme.templateCode === 'two-column' }"
            >
              <template #item="{ element: module }">
                <button
                  class="preview-block"
                  :class="{
                    'is-active': selectedModuleKey === module.key,
                    'preview-block--two-column': layoutConfig.theme.templateCode === 'two-column',
                    'preview-block--personal': module.type === 'personal'
                  }"
                  type="button"
                  @click="selectModule(module.key)"
                >
                  <ResumeBlockRenderer :module="module" :template-code="layoutConfig.theme.templateCode" />
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

.maker-topbar_left {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 12px;
  > .maker-topbar_left-back {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #64748b;
    font-size: 14px;
    cursor: pointer;
  }
  > .maker-topbar_left-title {
    display: flex;
    align-items: center;
    gap: 8px;

    >.maker-topbar_title{
      font-size: 16px;
      font-weight: 500;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }

    .maker-topbar_title-input {
      font-size: 16px;
      font-weight: 500;
      color: #111827;
      border: none;
      border-bottom: 1px solid transparent;
      background: transparent;
      transition: border-color 0.2s;
      cursor: pointer;
      &:focus {
        outline: none;
        border-color: #2563eb;
      }
    }
  }
}

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
  align-items: center;
  gap: 12px;
}

.maker-save-state {
  font-size: 13px;
  color: #64748b;

  &.is-saving {
    color: #2563eb;
  }

  &.is-saved {
    color: #16a34a;
  }

  &.is-error {
    color: #dc2626;
  }
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
  min-height: calc(100vh - 210px);
  max-height: calc(100vh - 210px);
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
}


.module-rail,
.editor-card {
    overflow: scroll;
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
  padding: 15px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.editor-panel__header,
.preview-panel__toolbar {
  margin-bottom: 5px;

  display: flex;
  flex-direction: column;
  gap: 5px;

  h2 {
    margin: 4px 0 0;
    font-size: 18px;
    line-height: 1.4;
    color: #111827;
  }
}

.preview-panel__heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-layout-toolbar {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);

  label {
    gap: 6px;
  }

  span {
    font-size: 12px;
    color: #64748b;
  }
}

.preview-layout-toolbar__presets,
.preview-layout-toolbar__palette {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-layout-toolbar__preset-list,
.preview-layout-toolbar__palette-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}



.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 2px solid transparent;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.24);

  &.is-active {
    border-color: #fff;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.18);
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
  padding-right: 6px;
  overflow: scroll;
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

.preview-block-list--two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: start;
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

.preview-block--two-column {
  margin-top: 0 !important;
  min-width: 0;
}

.preview-block--two-column.preview-block--personal {
  grid-column: 1 / -1;
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
  transform: translateY(-50%);

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

  .preview-layout-toolbar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  .preview-block-list--two-column {
    grid-template-columns: 1fr;
  }

  .preview-layout-toolbar {
    grid-template-columns: 1fr;
  }
}

.preset-chip {
  display: flex;
  flex-direction: row;
  gap: 3px;
}


</style>
