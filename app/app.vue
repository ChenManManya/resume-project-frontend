<template>
  <n-message-provider>
    <n-modal-provider>
      <AppMessageBridge />
      
      <NuxtPage />
    </n-modal-provider>
  </n-message-provider>
</template>

<script setup lang="ts">
import AppMessageBridge from '~/components/AppMessageBridge.vue'

</script>
