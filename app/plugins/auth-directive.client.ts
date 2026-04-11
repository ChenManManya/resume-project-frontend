// plugins/auth-directive.client.ts
import { defineNuxtPlugin } from '#app'
import { useAuthState } from '~/composables/useAuthState'

const authHandlerMap = new WeakMap<HTMLElement, (e: Event) => void>()

export default defineNuxtPlugin((nuxtApp) => {
  const authState = useAuthState()

  nuxtApp.vueApp.directive('auth', {
    mounted(el: HTMLElement, binding) {
      const handler = (e: Event) => {
        if (!authState.isAuthed.value) {
            e.preventDefault()
            e.stopPropagation()
            navigateTo('/login')
            return
        }
        
        if (typeof binding.value === 'function') {
        binding.value(true)
        }
      }
      authHandlerMap.set(el, handler)
      el.addEventListener('click', handler, true)
    },
    unmounted(el: HTMLElement) {
      const handler = authHandlerMap.get(el)
      if (handler) {
        el.removeEventListener('click', handler, true)
        authHandlerMap.delete(el)
      }
    }
  })
})