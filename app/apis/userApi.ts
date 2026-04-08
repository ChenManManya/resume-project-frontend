import { apiFetch } from '~/utils/http'

export interface UserProfilePayload {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phoneNumber: string
  employmentStatus: number
  status: number
}

export interface UpdateUserProfilePayload {
  nickname?: string
  email?: string
  phoneNumber?: string
  employmentStatus?: number
  avatarFile?: File | null
}

export const getUserProfile = () => {
  return apiFetch<ApiResult<UserProfilePayload>>('/user/profile', {
    method: 'GET'
  })
}

export const updateUserProfile = (payload: UpdateUserProfilePayload) => {
  const formData = new FormData()

  if (payload.nickname !== undefined) formData.append('nickname', payload.nickname)
  if (payload.email !== undefined) formData.append('email', payload.email)
  if (payload.phoneNumber !== undefined) formData.append('phoneNumber', payload.phoneNumber)
  if (payload.employmentStatus !== undefined) formData.append('employmentStatus', String(payload.employmentStatus))
  if (payload.avatarFile) formData.append('avatarFile', payload.avatarFile)

  return apiFetch<ApiResult<UserProfilePayload>>('/user/profile', {
    method: 'PUT',
    body: formData
  })
}
