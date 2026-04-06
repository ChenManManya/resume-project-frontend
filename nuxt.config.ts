// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,

  modules: ['nuxtjs-naive-ui','@pinia/nuxt'],

  css: [
    '~/assets/scss/global.scss'
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variable.scss" as *;'
        }
      }
    },
    ssr: {
      noExternal: ['naive-ui']
    }
  }
})