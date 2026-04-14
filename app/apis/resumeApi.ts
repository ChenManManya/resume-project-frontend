import type { ResumeLayoutConfig, ResumeModule } from '~/types/resume'
import { useAccessToken } from '~/utils/authStorage'
export interface ResumeDetailPayload {
  resumeId: number
  currentVersionId: number
  title: string
  templateId: number
  status: string
  contentJson: {
    modules: ResumeModule[]
  }
  layoutJson: ResumeLayoutConfig
}

export interface MyResumePayload {
  id: number
  title: string
  templateId: number
  status: string
  updateTime: string
  previewImageUrl?: string
}

interface CreateResumeRequest {
  templateId: number
  title: string
}

interface SaveDraftRequest {
  title: string
  templateId: number
  contentJson: {
    modules: ResumeModule[]
  }
  layoutJson: ResumeLayoutConfig
}

export const createResume = (payload: CreateResumeRequest) => {
  return useHttpPost<ResumeDetailPayload>('resumes', '/resumes', {
    body: payload
  })
}

export const getResumeDetail = (resumeId: number) => {
  return useHttpGet<ResumeDetailPayload>('resumesDetails',`/resumes/${resumeId}`)
}

export const saveResumeDraft = (resumeId: number, payload: SaveDraftRequest) => {
  return useHttp<ResumeDetailPayload>('resumeDraft',`/resumes/${resumeId}/draft`, {
    method: 'PUT',
    body: payload,
    $: true
  })
}

const downloadBlob = async (url: string, fileName: string, versionId?: number) => {
  const { getAccessToken } = useAccessToken()
  const blob = await $fetch<Blob>(url, {
    method: 'POST',
    body: versionId ? { versionId } : {},
    responseType: 'blob',
    baseURL: useRuntimeConfig().public.resumeApiBase,
    headers: getAccessToken()
      ? {
          Authorization: `Bearer ${getAccessToken()}`
        }
      : undefined
  })

  const blobUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = blobUrl
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(blobUrl)
}

export const exportResumePdf = (resumeId: number, versionId?: number) => {
  return downloadBlob(`/resumes/${resumeId}/export/pdf`, `resume-${resumeId}.pdf`, versionId)
}

export const exportResumePng = (resumeId: number, versionId?: number) => {
  return downloadBlob(`/resumes/${resumeId}/export/png`, `resume-${resumeId}.png`, versionId)
}


export const myResumesList = async (params: {pageNum: number, pageSize: number}) => {
  return useHttpGet<PageResult<MyResumePayload>>(`myResumeList:${params.pageNum}:${params.pageSize}`,'/resumes/my/page', {
    query: {
      pageNum: params.pageNum,
      pageSize: params.pageSize
    },
    $: true
  })
}



export const uploadPhoto = (photofile:File) => {
  const formdata = new FormData();
  formdata.append('file', photofile)
  return useHttp<string>('uploadPhoto', '/upload/photo', {
    method: 'POST',
    body:formdata,
    $:true,
  })
}