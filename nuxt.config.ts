export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,

  runtimeConfig: {
    public: {
      resumeApiBase: '/api'
    }
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8080/',
        changeOrigin: true,
        prependPath: false
      }
    }
  },

  modules: ['@pinia/nuxt'],

  css: [
    '~/assets/scss/global.scss'
  ],

  typescript: {
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: true
      }
    }
  },

  build: {
    transpile: ['naive-ui', "vueuc"]
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variable.scss" as *;'
        }
      }
    },
    optimizeDeps: {
      include: ['naive-ui', 'vueuc'] // 加上 vueuc
    },
    ssr: {
      noExternal: ['vueuc']
    }
  }
})