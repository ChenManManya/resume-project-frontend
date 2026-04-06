<script setup lang="ts">
import ResumeBlockRenderer from '~/components/resume/ResumeBlockRenderer.vue'
import type { ResumeModule } from '~/types/resume'

withDefaults(
  defineProps<{
    modules: ResumeModule[]
    printMode?: boolean
  }>(),
  {
    printMode: false
  }
)
</script>

<template>
  <div class="resume-document" :class="{ 'resume-document--print': printMode }">
    <div class="resume-document__paper">
      <div class="resume-document__content">
        <ResumeBlockRenderer
          v-for="module in modules"
          :key="module.key"
          :module="module"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.resume-document {
  display: flex;
  justify-content: center;
}

.resume-document__paper {
  width: 210mm;
  min-height: 297mm;
  margin: 20px auto;
  padding: 10mm;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.resume-document__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  font-size: 13px;
}

.resume-document--print .resume-document__paper {
  margin: 0;
  box-shadow: none;
}

@media print {
  .resume-document {
    display: block;
  }

  .resume-document__paper {
    margin: 0;
    box-shadow: none;
  }

  .resume-document__content > * {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
