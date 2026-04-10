
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
  avatar?: string
}

export const getUserProfile = () => {
  return useHttpGet<UserProfilePayload>('userProfile','/user/profile', {$:true})
}

export const updateUserProfile = (payload: UpdateUserProfilePayload) => {
  return useHttp<UserProfilePayload>('userProfilePut','/user/profile', {
    method: 'PUT',
    body: payload,
    $: true
  })
}


export const uploadAvatar = (avatarfile:File) => {
  const formdata = new FormData();
  formdata.append('file', avatarfile)
  return useHttp<string>('uploadAvatar', '/upload/avatar', {
    method: 'POST',
    body:formdata,
    $:true,
  })
}
