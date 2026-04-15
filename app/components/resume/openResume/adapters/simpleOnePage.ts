import CardType from '~/enums/cardEnum'
import type { ResumeCardItem, ResumeLayoutConfig, ResumeModule } from '~/types/resume'

interface OpenResumeLeftItem {
  title: string
  labels: string[]
}

interface OpenResumeWorkingItem {
  title: string
  startTime: string
  endTime: string
  content: string
}

export interface OpenResumeSimpleDocumentData {
  name: string
  city: string
  phoneNumber: string
  email: string
  introduce: string
  sidebar: OpenResumeLeftItem[]
  baseInfo: OpenResumeLeftItem
  workingHistory: OpenResumeWorkingItem[]
  primaryColor: string
}

const stringifyItem = (item: ResumeCardItem) => {
  const segments = [item.major, item.degree, item.role, item.subtitle, item.dept, item.pos, item.learnMethod, item.location].filter(Boolean)
  return [item.title, ...segments].join(' · ')
}

const stripHtml = (value?: string) => {
  if (!value) return ''

  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

const getSection = (modules: ResumeModule[], key: string, cardType?: CardType) => {
  return modules.find((module) => module.key === key && module.type === 'section' && (!cardType || module.cardType === cardType))
}

export const toOpenResumeSimpleDocument = (modules: ResumeModule[], layout?: ResumeLayoutConfig): OpenResumeSimpleDocumentData => {
  const personalModule = modules.find((module) => module.type === 'personal')
  const educationModule = getSection(modules, 'education') || getSection(modules, 'education-advanced', CardType.EDUCATION)
  const skillsModule = getSection(modules, 'skills', CardType.SKILL)
  const workModule = getSection(modules, 'work', CardType.WORK)
  const introductionModule = getSection(modules, 'introduction')
  const personal = personalModule?.type === 'personal' ? personalModule.data : undefined

  const sidebar: OpenResumeLeftItem[] = []

  if (educationModule?.type === 'section' && educationModule.items.length) {
    sidebar.push({ title: educationModule.title, labels: educationModule.items.map(stringifyItem) })
  }

  if (skillsModule?.type === 'section' && skillsModule.items.length) {
    sidebar.push({
      title: skillsModule.title,
      labels: skillsModule.items.flatMap((item) => [item.title, stripHtml(item.content)].filter(Boolean))
    })
  }

  const workingHistory: OpenResumeWorkingItem[] = workModule?.type === 'section'
    ? workModule.items.map((item) => ({
        title: [item.title, item.pos].filter(Boolean).join(' · '),
        startTime: item.date?.split(/[-~—至]/)[0]?.trim() || item.date || '',
        endTime: item.date?.split(/[-~—至]/).slice(1).join('-').trim() || '',
        content: stripHtml(item.content)
      }))
    : []

  return {
    name: personal?.name || '未命名',
    city: personal?.address || '',
    phoneNumber: personal?.phone || '',
    email: personal?.email || '',
    introduce: introductionModule?.type === 'section' ? introductionModule.items.map((item) => stripHtml(item.content)).filter(Boolean).join('\n') : '',
    sidebar,
    baseInfo: {
      title: '基础信息',
      labels: [personal?.phone, personal?.email, personal?.address].filter(Boolean) as string[]
    },
    workingHistory,
    primaryColor: layout?.theme.primaryColor || '#2563eb'
  }
}
