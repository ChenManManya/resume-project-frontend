import { storeToRefs } from 'pinia'
import { useCurrentUserStore } from '~/stores/currentUser'

export const useCurrentUser = () => {
  const store = useCurrentUserStore()
  const { currentUser, loading } = storeToRefs(store)

  return {
    currentUser,
    loading,
    load: store.load,
    clear: store.clear
  }
}
