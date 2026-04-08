<template>
  <n-message-provider>
    <AppMessageBridge>
      <NuxtPage />
    </AppMessageBridge>
  </n-message-provider>
</template>
<script setup lang="ts">
import AppMessageBridge from '~/components/AppMessageBridge.vue'
</script>
