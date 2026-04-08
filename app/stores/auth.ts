import { defineStore } from 'pinia'
import { useAccessToken } from '~/utils/authStorage'

export const useAuthStore = defineStore('auth', () => {
  const { token: cookieToken, getAccessToken, setAccessToken, clearAccessToken } = useAccessToken()
  const token = computed(() => cookieToken.value ?? '')
  const isAuthed = computed(() => Boolean(token.value))
  const initialized = useState<boolean>('auth-store-initialized', () => false)

  const refresh = () => {
    const current = getAccessToken()
    if (current !== token.value) {
      setAccessToken(current)
    }
    initialized.value = true
  }

  const setToken = (value: string) => {
    setAccessToken(value)
    initialized.value = true
  }

  const clear = () => {
    clearAccessToken()
    initialized.value = true
  }

  if (import.meta.client && !initialized.value) {
    refresh()
  }

  return {
    token,
    isAuthed,
    initialized,
    refresh,
    setToken,
    clear
  }
})
