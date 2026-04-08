import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

export const useAuthState = () => {
  const store = useAuthStore()
  const { token, isAuthed } = storeToRefs(store)

  return {
    token,
    isAuthed,
    refresh: store.refresh,
    setToken: store.setToken,
    clear: store.clear
  }
}
