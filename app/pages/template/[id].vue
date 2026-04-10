<script setup lang="ts">
import AppTopNav from '~/components/AppTopNav.vue'
import ResumeDocument from '~/components/resume/ResumeDocument.vue'
import { checkFavoriteTemplate, favoriteTemplate, getTemplateDetails, type TemplatePayload } from '~/apis/templatesApi'
import { createDefaultResumeLayout, createDefaultResumeModules } from '~/utils/resumeData'
import type { ResumeLayoutConfig, ResumeModule } from '~/types/resume'

const route = useRoute()
const config = useRuntimeConfig()
const templateId: number = Number(route.params.id)
const templateData = reactive<Partial<TemplatePayload>>({})
const presetThemeColors = ['#111111', '#4f6ef7', '#8b9098', '#b63c34', '#d46b47', '#f59e0b', '#8b5cf6', '#7bb661']
const selectedThemeColor = ref('')

const parseJson = <T>(value: unknown): T | null => {
  if (value && typeof value === 'object') {
    return value as T
  }

  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

const isFavoriteTemplate:any = ref<Boolean>(false);




const { data } = await getTemplateDetails(templateId)
watchEffect(() => {
  if (data.value) {
    Object.assign(templateData, data.value)
  }
})

const resolveAssetUrl = (url?: string) => {
  if (!url) {
    return url
  }

  if (/^http?:\/\//.test(url) || url.startsWith('data:')) {
    return url
  }

  const baseURL = typeof config.public.resumeApiBase === 'string' ? config.public.resumeApiBase : ''

  if (import.meta.client) {
    const origin = window.location.origin
    const normalizedBase = baseURL.startsWith('http') ? baseURL : `${origin}${baseURL}`
    return new URL(url.replace(/^\//, ''), `${normalizedBase.replace(/\/$/, '')}/`).toString()
  }

  return url
}


const previewModules = computed<ResumeModule[]>(() => {
  const defaultContent = parseJson<{ modules?: ResumeModule[] }>(templateData.defaultContentJson)

  if (!defaultContent?.modules?.length) {
    return createDefaultResumeModules()
  }

  return defaultContent.modules.map((module) => {
    if (module.type !== 'personal') {
      return module
    }

    return {
      ...module,
      data: {
        ...module.data,
        photo: resolveAssetUrl(module.data.photo)
      }
    }
  })
})

const previewLayout = computed<ResumeLayoutConfig>(() => {
  const base = createDefaultResumeLayout()
  const style = parseJson<Partial<ResumeLayoutConfig>>(templateData.styleJson)

  if (!style) {
    return {
      ...base,
      theme: {
        ...base.theme,
        primaryColor: selectedThemeColor.value || base.theme.primaryColor
      }
    }
  }

  const merged = {
    ...base,
    ...style,
    theme: {
      ...base.theme,
      ...(style.theme ?? {})
    },
    page: {
      ...base.page,
      ...(style.page ?? {})
    }
  }

  if (selectedThemeColor.value) {
    merged.theme.primaryColor = selectedThemeColor.value
  }

  return merged
})

watchEffect(() => {
  if (!selectedThemeColor.value && templateData.styleJson) {
    const style = parseJson<Partial<ResumeLayoutConfig>>(templateData.styleJson)
    selectedThemeColor.value = style?.theme?.primaryColor ?? createDefaultResumeLayout().theme.primaryColor
  }
})

const FavoriteThisTemplate = async ()=>{
  const {data, error} = await favoriteTemplate(templateId)
  isFavoriteTemplate.value = !isFavoriteTemplate.value
}

onMounted(async () => {
  const {data} = await checkFavoriteTemplate(templateId)
  isFavoriteTemplate.value = data.value
})

</script>

<template>
  <div class="template-page">
    <AppTopNav />
    <div class="template-shell">
      <NuxtLink class="template-back" to="/">返回模板广场</NuxtLink>

      <section class="template-hero">
        <div>
          <span class="template-kicker">模板详情</span>
          <h1>{{ templateData.name }}</h1>
          <p>{{ templateData.description }}</p>
          <div class="template-tags">
            <span v-for="tag in templateData.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="template-color-picker">
            <span>选择颜色：</span>
            <button
              v-for="color in presetThemeColors"
              :key="color"
              type="button"
              class="template-color-dot"
              :class="{ 'is-active': selectedThemeColor === color }"
              :style="{ background: color }"
              @click="selectedThemeColor = color"
            />
            <label class="template-color-custom">
              <span />
              <input v-model="selectedThemeColor" type="color" />
            </label>
          </div>
        </div>

        <div class="template-cta">
          <NuxtLink class="template-cta__button" :to="`/maker?templateId=${templateData.id}`">使用这个模板</NuxtLink>
          <n-button type="success" @click="FavoriteThisTemplate">{{ isFavoriteTemplate ? '取消收藏': '收藏此模板' }}</n-button>
          <small>进入编辑器后可继续调整字体、主色与排版。</small>
        </div>
      </section>

      <section class="template-grid">
        <article class="template-panel">
          <div class="template-panel__preview">
            <div class="template-document-preview">
              <ResumeDocument :modules="previewModules" :layout="previewLayout" />
            </div>
          </div>
        </article>

        <article class="template-panel">
          <div class="template-panel__header">
            <span>模板亮点</span>
          </div>
          <ul class="template-metrics">
            <!-- <li v-for="metric in template.metrics" :key="metric">{{ metric }}</li> -->
          </ul>

          <div class="template-panel__header">
            <span>推荐模板</span>
          </div>
          <div class="template-sections">
            <!-- <span v-for="section in template.sections" :key="section">{{ section }}</span> -->
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.template-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #eef2ff 100%);
}

.template-shell {
  width: min(1180px, 100%);
  margin: 28px auto 0;
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

.template-color-picker {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;

  > span {
    color: #475569;
    font-size: 13px;
  }
}

.template-color-dot,
.template-color-custom {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 2px solid transparent;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.28);
  overflow: hidden;

  &.is-active {
    border-color: #fff;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.18);
  }
}

.template-color-custom {
  position: relative;
  background: linear-gradient(135deg, #ff3b30, #ffcc00, #34c759, #007aff, #af52de);

  span {
    position: absolute;
    inset: 0;
  }

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
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
  grid-template-columns: minmax(0, 0.92fr) minmax(340px, 0.88fr);
  gap: 20px;
  margin-top: 20px;
  padding-bottom: 30px;
}

.template-panel {
  padding: 14px;
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

.template-document-preview {
  width: 100%;
  max-width: 620px;
  height: 860px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 0 auto;
  padding: 0;

  :deep(.resume-document) {
    transform: scale(0.73);
    transform-origin: top center;
    margin: 0;
    pointer-events: none;
  }

  :deep(.resume-document__paper) {
    box-shadow: none;
    margin: 0 auto;
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
    padding: 0 20px 20px;
  }

  .template-hero,
  .template-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .template-cta {
    width: 100%;
  }

  .template-document-preview {
    width: 100%;
    max-width: 480px;
    height: 820px;

    :deep(.resume-document) {
      transform: scale(0.6);
      transform-origin: top center;
    }
  }
}
</style>
