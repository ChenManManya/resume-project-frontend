<script setup lang="ts">
import { computed } from 'vue'
import ResumeDocument from '~/components/resume/ResumeDocument.vue'
import { createDefaultResumeLayout, createDefaultResumeModules } from '~/utils/resumeData'
import { deserializeResumeLayout, deserializeResumeModules, getResumePrintLayoutKey, getResumePrintPayloadKey } from '~/utils/resumePrintRoute'
import type { ResumeLayoutConfig, ResumeModule } from '~/types/resume'

const route = useRoute()

const modules = computed<ResumeModule[]>(() => {
  const payload = route.query[getResumePrintPayloadKey()]

  if (typeof payload !== 'string' || payload.length === 0) {
    return createDefaultResumeModules()
  }

  try {
    return deserializeResumeModules(payload)
  } catch {
    return createDefaultResumeModules()
  }
})

const layout = computed<ResumeLayoutConfig>(() => {
  const payload = route.query[getResumePrintLayoutKey()]

  if (typeof payload !== 'string' || payload.length === 0) {
    return createDefaultResumeLayout()
  }

  try {
    return deserializeResumeLayout(payload)
  } catch {
    return createDefaultResumeLayout()
  }
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
