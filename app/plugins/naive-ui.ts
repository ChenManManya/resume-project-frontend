import { defineNuxtPlugin } from '#app'
import { setup } from '@css-render/vue3-ssr'

export default defineNuxtPlugin((nuxtApp) => {
  const { collect } = setup(nuxtApp.vueApp)

  const prev = nuxtApp.ssrContext?.renderMeta as
  | (() => { headTags?: string })
  | undefined

  if (nuxtApp.ssrContext) {
    nuxtApp.ssrContext.renderMeta = () => {
      const meta = prev ? prev() : {}
      return {
        ...meta,
        headTags: (meta.headTags || '') + collect()
      }
    }
  }
})