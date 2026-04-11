import { createDiscreteApi } from 'naive-ui'

export const fetchConfig = {
  baseURL: 'http://localhost:8080'
}

const isSuccessResult = <T>(res: ApiResult<T>) => res.code === 200 || res.code === 401
const { message } = createDiscreteApi(["message"]);
function useGetFetchOptions(options: any = {}) {
  const config = useRuntimeConfig()
  const { getAccessToken } = useAccessToken()

  options.baseURL = options.baseURL ?? config.public.resumeApiBase ?? fetchConfig.baseURL
  if (import.meta.client && typeof options.baseURL === 'string' && options.baseURL.startsWith('/')) {
    options.baseURL = `${window.location.origin}${options.baseURL}`
  }
  options.headers = options.headers ?? {}
  options.initialCache = options.initialCache ?? false;
  options.lazy = options.lazy ?? false;

  const token = getAccessToken()
  if (token) {
    options.headers.Authorization = `Bearer ${token}`
  }

  if (options.body) {
    const rawBody = toRaw(options.body);
    
    if (rawBody instanceof FormData || rawBody instanceof Blob) {
      options.body = rawBody;
      
      if (options.headers) {
        delete options.headers['Content-Type'];
        delete options.headers['content-type'];
      }
    } else if (typeof rawBody === "object") {
      options.body = { ...rawBody };
    } else {
      options.body = rawBody;
    }
  }
  return options
}

export async function useHttp<T = unknown>(
  key: string,
  url: string,
  options: any = {}
) {
  const { clearAccessToken } = useAccessToken()

  options = useGetFetchOptions(options)
  options.key = key

  if (options.$) {
    const data = ref<T | null>(null)
    const error = ref<any>(null)

    return await $fetch<ApiResult<T>>(url, options)
      .then((res) => {
        if(res.code == 401 ) {
          clearAccessToken();

        }

        // 服务端错误处理
        if (!isSuccessResult(res)) {
          const msg = res.message || '服务端错误';
          message.error(msg);
          error.value = msg;
          return {
            data,
            error
          }
        }
        data.value = res.data
        return {
          data,
          error
        }
      })
      .catch((err) => {
        const msg = err?.data?.data;
        message.error(msg || "服务端错误");
        error.value = msg;
        return {
          data,
          error
        }
      })
  }

  const res = await useFetch<ApiResult<T>>(url, {
    ...options,
    transform: (result) => {
      return result.data;
    }
  })
  // 客户端错误处理
  if (process.client && res.error.value) {
    const msg = res.error.value.data
    if (!options.lazy) {
      message.error(msg || "服务端错误");
    }
  }


  return res
}

export function useHttpGet<T = unknown>(
  key: string,
  url: string,
  options: any = {}
) {
  options.method = 'GET'
  return useHttp<T>(key, url, options)
}

export function useHttpPost<T = unknown>(
  key: string,
  url: string,
  options: any = {}
) {
  options.method = 'POST'
  return useHttp<T>(key, url, options)
}
