import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  routeRules: {
    '/maker/**': { ssr: false },
    '/personal': { ssr: false },
    '/login': { ssr: false },
    '/register': { ssr: false },  },

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
  app: {
    head: {
      title: '慢慢简历 - 在线简历生成器',
      meta: [
        { name: 'description', content: '一个在线简历生成器，帮助用户快速创建专业的简历。' },
        { name: 'keywords', content: '在线简历生成器, 简历模板, 简历设计, 简历制作' },
        { name: 'author', content: '陈慢慢' }
      ]
    }
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