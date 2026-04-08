const TOKEN_KEY = 'resume_access_token'

const useTokenState = () => {
  const token = useState<string | null>('auth-token', () => null)
  const tokenCookie = useCookie<string | null>(TOKEN_KEY, {
    default: () => null,
    sameSite: 'lax'
  })

  if (token.value === null && tokenCookie.value) {
    token.value = tokenCookie.value
  }

  return {
    token,
    tokenCookie
  }
}

export const useAccessToken = () => {
  const { token, tokenCookie } = useTokenState()

  const getAccessToken = () => {
    return token.value ?? ''
  }

  const setAccessToken = (val: string) => {
    token.value = val
    tokenCookie.value = val
  }

  const clearAccessToken = () => {
    token.value = null
    tokenCookie.value = null
  }

  return {
    token,
    getAccessToken,
    setAccessToken,
    clearAccessToken,
  }
}

export const getAccessToken = () => {
  return useAccessToken().getAccessToken()
}

export const setAccessToken = (val: string) => {
  useAccessToken().setAccessToken(val)
}

export const clearAccessToken = () => {
  useAccessToken().clearAccessToken()
}
