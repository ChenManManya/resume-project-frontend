import type { Component } from 'vue'
import CardStyleCard from '~/components/resume/cardStyleTemplate/CardStyleCard.vue'
import CardStylePersonalInfo from '~/components/resume/cardStyleTemplate/CardStylePersonalInfo.vue'
import SimpleCard from '~/components/resume/simpleTemplate/SimpleCard.vue'
import SimplePersonalInfo from '~/components/resume/simpleTemplate/SimplePersonalInfo.vue'
import TwoColumnCard from '~/components/resume/twoColumnTemplate/TwoColumnCard.vue'
import TwoColumnPersonalInfo from '~/components/resume/twoColumnTemplate/TwoColumnPersonalInfo.vue'

export interface ResumeTemplateComponents {
  PersonalInfo: Component
  Card: Component
}

const templateRegistry: Record<string, ResumeTemplateComponents> = {
  simple: {
    PersonalInfo: SimplePersonalInfo,
    Card: SimpleCard
  },
  'two-column': {
    PersonalInfo: TwoColumnPersonalInfo,
    Card: TwoColumnCard
  },
  'card-style': {
    PersonalInfo: CardStylePersonalInfo,
    Card: CardStyleCard
  }
}

export const DEFAULT_TEMPLATE_CODE = 'simple'

export const resolveResumeTemplateComponents = (templateCode?: string) => {
  if (templateCode && templateRegistry[templateCode]) {
    return templateRegistry[templateCode]
  }

  return templateRegistry[DEFAULT_TEMPLATE_CODE]
}
