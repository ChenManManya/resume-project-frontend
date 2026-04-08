import { useAccessToken } from '~/utils/authStorage'
import { apiFetch } from '~/utils/http'
export interface CaptchaPayload {
  captchaKey: string
  captchaCode?: string
  captchaImage?: string
}

interface AuthRequest {
  username: string
  password: string
  captchaCode: string
  captchaKey: string
}

interface RegisterRequest extends AuthRequest {
  email: string
}

const extractToken = (payload: Record<string, any>) => {
  return payload.token ?? payload.accessToken ?? payload.access_token ?? payload.data ?? ''
}

export const getCaptcha = async () => {
  const data = await apiFetch<Record<string, any>>('/captcha')

  return {
    captchaKey: data.captchaKey ?? data.key ?? '',
    captchaCode: data.captchaCode ?? data.code,
    captchaImage: data.captchaImage ?? data.imageBase64 ?? data.base64 ?? data.img
  } satisfies CaptchaPayload
}

export const login = async (payload: AuthRequest) => {
  const { setAccessToken } = useAccessToken()
  const res = await apiFetch<Record<string, any>>('/auth/login', {
    method: 'POST',
    body: payload
  })

  const token = extractToken(res)
  if (token) {
    setAccessToken(token)
  }

  return res
}

export const register = async (payload: RegisterRequest) => {
  return apiFetch<Record<string, any>>('/auth/register', {
    method: 'POST',
    body: payload
  })
}

export const logout = async () => {
  const { clearAccessToken } = useAccessToken()
  await apiFetch('/auth/logout', {
    method: 'GET'
  })

  clearAccessToken()
}
