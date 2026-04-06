<script setup lang="ts">
import SimpleCard from '~/components/resume/simpleTemplate/SimpleCard.vue'
import SimplePersonalInfo from '~/components/resume/simpleTemplate/SimplePersonalInfo.vue'
import type { ResumeModule } from '~/types/resume'

defineProps<{
  module: ResumeModule
}>()
</script>

<template>
  <SimplePersonalInfo
    v-if="module.type === 'personal'"
    :personal-info="module.data"
  />
  <SimpleCard
    v-else
    :card-type="module.cardType"
    :title="module.title"
    :items="module.items"
  />
</template>
