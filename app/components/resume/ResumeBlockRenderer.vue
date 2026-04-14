<script setup lang="ts">
import { computed } from 'vue'
import { resolveResumeTemplateComponents } from '~/components/resume/templateRegistry'
import type { ResumeModule } from '~/types/resume'

const props = withDefaults(defineProps<{
  module: ResumeModule
  templateCode?: string
}>(), {
  templateCode: 'simple'
})

const resolvedTemplateComponents = computed(() => resolveResumeTemplateComponents(props.templateCode))
const personalComponent = computed(() => resolvedTemplateComponents.value.PersonalInfo)
const cardComponent = computed(() => resolvedTemplateComponents.value.Card)
</script>

<template>
  <component
    v-if="module.type === 'personal'"
    :is="personalComponent"
    :personal-info="module.data"
  />
  <component
    v-else
    :is="cardComponent"
    :card-type="module.cardType"
    :title="module.title"
    :items="module.items"
  />
</template>
