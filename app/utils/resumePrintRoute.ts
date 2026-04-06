import type { ResumeModule } from '~/types/resume'

const QUERY_KEY = 'payload'

export const serializeResumeModules = (modules: ResumeModule[]) => {
  return encodeURIComponent(JSON.stringify(modules))
}

export const deserializeResumeModules = (payload: string) => {
  return JSON.parse(decodeURIComponent(payload)) as ResumeModule[]
}

export const buildResumePrintRoute = (modules: ResumeModule[]) => {
  const search = new URLSearchParams({
    [QUERY_KEY]: serializeResumeModules(modules)
  })

  return `/maker/print?${search.toString()}`
}

export const getResumePrintPayloadKey = () => QUERY_KEY
