import { useAccessToken } from '~/utils/authStorage'


const isSuccessResult = (body: ApiResult<unknown>) => {
  if (typeof body.success === 'boolean') {
    return body.success
  }
  return body.code === 200
}

export const apiFetch = <T>(url: string, options: Parameters<typeof $fetch<T>>[1] = {}) => {
  const config = useRuntimeConfig()
  const { $message } = useNuxtApp()
  const { getAccessToken, clearAccessToken } = useAccessToken()

  const client = $fetch.create({
    baseURL: config.public.resumeApiBase,
    onRequest({ options }) {
      const token = getAccessToken()
      if (token) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`
        }
      }
    },
    onResponse({ response }) {
      const body = response._data as ApiResult<T> | Blob | undefined
      if (!body || typeof Blob !== 'undefined' && body instanceof Blob) {
        return
      }

      if (typeof body === 'object' && 'code' in body && 'message' in body) {
        if (!isSuccessResult(body as ApiResult<T>)) {
            $message.warning(body.message || '请求失败')
        }
        response._data = body as ApiResult<T>
      }
    },
    onResponseError({ response }) {
      if (response?.status === 401) {
        clearAccessToken()
        $message.error('登录已过期，请重新登录')
        
      }
    }
  })

  return client<T>(url, options)
}
