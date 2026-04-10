import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,

  runtimeConfig: {
    public: {
      resumeApiBase: '/dev-api'
    }
  },

  nitro: {
    routeRules: {
      '/dev-api/**': {
        proxy: 'http://localhost:8080/dev-api/**'
      }
    }
  },

  modules: ['@pinia/nuxt'],

  css: ['~/assets/scss/global.scss'],

  typescript: {
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: true
      }
    }
  },

  build: {
    transpile: ['naive-ui', 'vueuc']
  },

  vite: {
    plugins: [
      Components({
        resolvers: [NaiveUiResolver()],
        dts: true
      })
    ],

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variable.scss" as *;'
        }
      },
    },

    optimizeDeps: {
      include: ['naive-ui', 'vueuc', '@css-render/vue3-ssr']
    },

    ssr: {
      noExternal: ['naive-ui', 'vueuc']
    }
  }
})