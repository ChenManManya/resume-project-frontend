import type { Component } from 'vue'
import OpenResumeSimpleOnePage1Document from '~/components/resume/openResume/simpleOnePage1Document.vue'
import OpenResumeSimpleOnePage2Document from '~/components/resume/openResume/simpleOnePage2Document.vue'

const documentTemplateRegistry: Record<string, Component> = {
  'open-simple-one-page-1': OpenResumeSimpleOnePage1Document,
  'open-simple-one-page-2': OpenResumeSimpleOnePage2Document,
}

export const resolveResumeDocumentTemplate = (templateCode?: string) => {
  if (!templateCode) {
    return null
  }

  return documentTemplateRegistry[templateCode] ?? null
}
