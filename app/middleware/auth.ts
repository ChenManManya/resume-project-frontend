import { useAccessToken } from '~/utils/authStorage'



export default defineNuxtRouteMiddleware((to) => {
  const { getAccessToken } = useAccessToken()

  if (!import.meta.client) {
    return
  }

  if (to.path === '/maker/print') {
    return
  }

  const token = getAccessToken()
  if (!token) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  }
})
