<script setup lang="ts">
import { computed } from 'vue'
import { getPublicResumeDetail } from '~/apis/resumeApi'
import ResumeDocument from '~/components/resume/ResumeDocument.vue'
import { createDefaultResumeLayout, createDefaultResumeModules } from '~/utils/resumeData'
import { deserializeResumeLayout, deserializeResumeModules, getResumePrintLayoutKey, getResumePrintPayloadKey } from '~/utils/resumePrintRoute'
import type { ResumeLayoutConfig, ResumeModule } from '~/types/resume'

const route = useRoute()

const resolveQueryModules = () => {
  const payload = route.query[getResumePrintPayloadKey()]

  if (typeof payload !== 'string' || payload.length === 0) {
    return createDefaultResumeModules()
  }

  try {
    return deserializeResumeModules(payload)
  } catch {
    return createDefaultResumeModules()
  }
}

const resolveQueryLayout = () => {
  const payload = route.query[getResumePrintLayoutKey()]

  if (typeof payload !== 'string' || payload.length === 0) {
    return createDefaultResumeLayout()
  }

  try {
    return deserializeResumeLayout(payload)
  } catch {
    return createDefaultResumeLayout()
  }
}

const resumeId = computed(() => {
  const value = Array.isArray(route.query.resumeId) ? route.query.resumeId[0] : route.query.resumeId
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
})

const { data: publicResumeDetail } = await useAsyncData(
  () => resumeId.value ? `print-resume:${resumeId.value}` : 'print-resume:query-fallback',
  async () => {
    if (!resumeId.value) {
      return null
    }

    const { data, error } = await getPublicResumeDetail(resumeId.value)

    if (error.value || !data.value) {
      return null
    }

    return data.value
  }
)
onMounted(async () => {
  await nextTick()

  // 数据/图片/异步逻辑完成后
  window.__PDF_READY__ = true
})
const modules = computed<ResumeModule[]>(() => {
  if (publicResumeDetail.value?.contentJson?.modules?.length) {
    // publicResumeDetail.value?.contentJson.modules.forEach((module: ResumeModule) => {
    //   if (module.type === 'personal' && module.data) {
    //     module.data.photo = fetchConfig.baseURL+"/dev-api" + module.data.photo 
    //   }
    // })
    console.log('modules', publicResumeDetail.value.contentJson.modules)
    return publicResumeDetail.value.contentJson.modules
  }

  return resolveQueryModules()
})

const layout = computed<ResumeLayoutConfig>(() => {
  if (publicResumeDetail.value?.layoutJson) {
    return publicResumeDetail.value.layoutJson
  }

  return resolveQueryLayout()
})
</script>

<template>
  <div class="maker-print-page">
    <ResumeDocument :modules="modules" :layout="layout" print-mode />
  </div>
</template>

<style scoped lang="scss">
.maker-print-page {
  padding: 24px 0;
}

@media print {
  .maker-print-page {
    padding: 0;
  }
}
</style>
