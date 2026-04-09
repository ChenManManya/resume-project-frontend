import { useAccessToken } from '~/utils/authStorage'
export interface CaptchaPayload {
  captchaKey: string
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

const extractToken = (payload: unknown) => {
  if (typeof payload === 'string') {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const record = payload as Record<string, any>
  return record.token ?? record.accessToken ?? record.access_token ?? record.data ?? ''
}

export const getCaptcha = async () => {
  return await useHttpGet<CaptchaPayload>('captcha', '/captcha',{$:true})
}

export const login = async (payload: AuthRequest) => {
  const { setAccessToken } = useAccessToken()
  const res = await useHttpPost<Record<string, any>>('login', '/auth/login', {
    body: payload,
    $:true
  })

  const token = extractToken(res.data.value ?? {})
  if (token) {
    setAccessToken(token)
  }

  return res
}

export const register = async (payload: RegisterRequest) => {
  return useHttpPost<Record<string, any>>('register','/auth/register', {
    body: payload,
    $:true
  })
}

export const logout = async () => {
  const { clearAccessToken } = useAccessToken()
  await useHttpGet('logout','/auth/logout', {$:true})

  clearAccessToken()
}
