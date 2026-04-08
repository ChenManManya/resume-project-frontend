<script setup lang="ts">
import { useMessage } from 'naive-ui'

const message = useMessage()
const nuxtApp = useNuxtApp()
// window.$message = message
nuxtApp.provide('message', message)
</script>

<template>
  <slot />
</template>
