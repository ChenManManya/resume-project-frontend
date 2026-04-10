<template>
  <n-message-provider>
    <AppMessageBridge />
    <NuxtPage />
  </n-message-provider>
</template>

<script setup lang="ts">
import AppMessageBridge from '~/components/AppMessageBridge.vue'

</script>
