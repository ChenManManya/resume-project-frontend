<script setup lang="ts">
import { computed } from 'vue'
import ResumeDocument from '~/components/resume/ResumeDocument.vue'
import { createDefaultResumeModules } from '~/utils/resumeData'
import { deserializeResumeModules, getResumePrintPayloadKey } from '~/utils/resumePrintRoute'
import type { ResumeModule } from '~/types/resume'

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
</script>

<template>
  <div class="maker-print-page">
    <ResumeDocument :modules="modules" print-mode />
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
