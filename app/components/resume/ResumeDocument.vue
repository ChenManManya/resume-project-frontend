<script setup lang="ts">
import { computed } from 'vue'
import ResumeBlockRenderer from '~/components/resume/ResumeBlockRenderer.vue'
import type { ResumeLayoutConfig, ResumeModule } from '~/types/resume'

const props = withDefaults(
  defineProps<{
    modules: ResumeModule[]
    layout?: ResumeLayoutConfig
    printMode?: boolean
  }>(),
  {
    printMode: false
  }
)

const paperStyle = computed(() => {
  if (!props.layout) {
    return {}
  }

  return {
    '--resume-font-family': props.layout.theme.fontFamily,
    '--resume-title-size': `${props.layout.theme.titleSize}px`,
    '--resume-body-size': `${props.layout.theme.bodySize}px`,
    '--resume-line-height': String(props.layout.theme.lineHeight),
    '--resume-primary-color': props.layout.theme.primaryColor,
    '--resume-section-gap': `${props.layout.theme.sectionGap}px`,
    '--resume-page-margin': props.layout.page.margin
  }
})
const templateCode = computed(() => props.layout?.theme.templateCode || 'simple')
const isTwoColumnTemplate = computed(() => templateCode.value === 'two-column')
</script>

<template>
  <div class="resume-document" :class="{ 'resume-document--print': printMode }" :style="paperStyle">
    <div class="resume-document__paper">
      <div class="resume-document__content" :class="{ 'resume-document__content--two-column': isTwoColumnTemplate }">
        <div
          v-for="module in modules"
          :key="module.key"
          class="resume-document__module"
          :class="{
            'resume-document__module--two-column': isTwoColumnTemplate,
            'resume-document__module--personal': module.type === 'personal'
          }"
        >
          <ResumeBlockRenderer
            :module="module"
            :template-code="templateCode"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.resume-document {
  display: flex;
  justify-content: center;
  --resume-font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  --resume-title-size: 24px;
  --resume-body-size: 13px;
  --resume-line-height: 1.7;
  --resume-primary-color: #2563eb;
  --resume-section-gap: 20px;
  --resume-page-margin: 10mm;
}

.resume-document__paper {
  width: 210mm;
  min-height: 297mm;
  margin: 20px auto;
  padding: var(--resume-page-margin);
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: var(--resume-font-family);
}

.resume-document__content {
  display: flex;
  flex-direction: column;
  gap: var(--resume-section-gap);
  width: 100%;
  font-size: var(--resume-body-size);
  line-height: var(--resume-line-height);
}

.resume-document__content--two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

.resume-document__module--two-column {
  min-width: 0;
}

.resume-document__module--two-column.resume-document__module--personal {
  grid-column: 1 / -1;
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

  .resume-document__content--two-column {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
