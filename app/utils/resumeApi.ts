import type { ResumeLayoutConfig, ResumeModule } from '~/types/resume'

export interface ResumeDetailPayload {
  resumeId: number
  currentVersionId: number
  versionNo: number
  title: string
  templateId: number
  status: string
  contentJson: {
    modules: ResumeModule[]
  }
  layoutJson: ResumeLayoutConfig
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
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

const getApiBase = () => {
  const config = useRuntimeConfig()
  return config.public.resumeApiBase as string
}

const unwrap = async <T>(promise: Promise<ApiResponse<T>>) => {
  const response = await promise
  return response.data
}

export const createResume = (payload: CreateResumeRequest) => {
  return unwrap(
    $fetch<ApiResponse<ResumeDetailPayload>>(`${getApiBase()}/resumes`, {
      method: 'POST',
      body: payload
    })
  )
}

export const getResumeDetail = (resumeId: number) => {
  return unwrap(
    $fetch<ApiResponse<ResumeDetailPayload>>(`${getApiBase()}/resumes/${resumeId}`)
  )
}

export const saveResumeDraft = (resumeId: number, payload: SaveDraftRequest) => {
  return unwrap(
    $fetch<ApiResponse<ResumeDetailPayload>>(`${getApiBase()}/resumes/${resumeId}/draft`, {
      method: 'PUT',
      body: payload
    })
  )
}

const downloadBlob = async (url: string, fileName: string, versionId?: number) => {
  const blob = await $fetch<Blob>(url, {
    method: 'POST',
    body: versionId ? { versionId } : {},
    responseType: 'blob'
  })

  const blobUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = blobUrl
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(blobUrl)
}

export const exportResumePdf = (resumeId: number, versionId?: number) => {
  return downloadBlob(`${getApiBase()}/resumes/${resumeId}/export/pdf`, `resume-${resumeId}.pdf`, versionId)
}

export const exportResumePng = (resumeId: number, versionId?: number) => {
  return downloadBlob(`${getApiBase()}/resumes/${resumeId}/export/png`, `resume-${resumeId}.png`, versionId)
}
