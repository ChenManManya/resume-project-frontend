import type { ResumeLayoutConfig, ResumeModule } from '~/types/resume'

const QUERY_KEY = 'payload'
const LAYOUT_QUERY_KEY = 'layout'

export const serializeResumeModules = (modules: ResumeModule[]) => {
  return encodeURIComponent(JSON.stringify(modules))
}

export const deserializeResumeModules = (payload: string) => {
  return JSON.parse(decodeURIComponent(payload)) as ResumeModule[]
}

export const serializeResumeLayout = (layout: ResumeLayoutConfig) => {
  return encodeURIComponent(JSON.stringify(layout))
}

export const deserializeResumeLayout = (payload: string) => {
  return JSON.parse(decodeURIComponent(payload)) as ResumeLayoutConfig
}

export const buildResumePrintRoute = (modules: ResumeModule[], layout: ResumeLayoutConfig) => {
  const search = new URLSearchParams({
    [QUERY_KEY]: serializeResumeModules(modules),
    [LAYOUT_QUERY_KEY]: serializeResumeLayout(layout)
  })

  return `/maker/print?${search.toString()}`
}

export const getResumePrintPayloadKey = () => QUERY_KEY
export const getResumePrintLayoutKey = () => LAYOUT_QUERY_KEY
