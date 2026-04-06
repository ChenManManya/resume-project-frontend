import type CardType from '~/enums/cardEnum'

export interface ResumePersonalInfo {
  name: string
  title: string
  phone: string
  email: string
  address: string
  photo?: string
  photoReverse?: boolean
}

export interface ResumeCardItem {
  id: number
  title?: string
  subtitle?: string
  content: string
  major?: string
  degree?: string
  date?: string
  dept?: string
  pos?: string
  role?: string
  projectLink?: string
  learnMethod?: string
  location?: string
}

export interface ResumePersonalModule {
  key: 'personal'
  type: 'personal'
  data: ResumePersonalInfo
}

export interface ResumeSectionModule {
  key: string
  type: 'section'
  cardType: CardType
  title: string
  items: ResumeCardItem[]
}

export type ResumeModule = ResumePersonalModule | ResumeSectionModule
