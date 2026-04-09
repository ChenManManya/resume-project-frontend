<script setup lang="ts">
import { useMessage } from 'naive-ui'

const message = useMessage()
const nuxtApp = useNuxtApp()
nuxtApp.provide('message', message)
</script>

<template>
  <slot />
</template>
