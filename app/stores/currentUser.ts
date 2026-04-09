import { defineStore } from 'pinia'
import { getUserProfile, type UserProfilePayload } from '~/apis/userApi'

export const useCurrentUserStore = defineStore('current-user', () => {
  const currentUser = ref<UserProfilePayload | null>(null)
  const loading = ref(false)

  const load = async () => {
    loading.value = true

    try {
      const {data,error} = await getUserProfile()
      currentUser.value = data.value;
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    currentUser.value = null
  }

  return {
    currentUser,
    loading,
    load,
    clear
  }
})
