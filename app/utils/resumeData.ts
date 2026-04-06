import CardType from '~/enums/cardEnum'
import type { ResumeModule } from '~/types/resume'

export const createDefaultResumeModules = (): ResumeModule[] => [
  {
    key: 'personal',
    type: 'personal',
    data: {
      name: '张三',
      title: '软件工程师',
      phone: '138-0000-0000',
      email: 'zhangsan@example.com',
      address: '北京市朝阳区',
      photo: '/image.png',
      photoReverse: false
    }
  },
  {
    key: 'work',
    type: 'section',
    cardType: CardType.WORK,
    title: '工作经历',
    items: [
      {
        id: 1,
        title: '字节跳动',
        pos: '软件工程师',
        dept: '核心产品部',
        content: '负责开发和维护公司核心产品，使用 Vue.js 和 Node.js 进行前后端开发。',
        date: '2020.01 - 2022.12',
        location: '北京'
      },
      {
        id: 2,
        title: '腾讯',
        pos: '前端开发工程师',
        dept: '技术部',
        content: '参与公司官网重构项目，使用 React 实现响应式布局与交互功能。',
        date: '2019.06 - 2019.12',
        location: '上海'
      }
    ]
  },
  {
    key: 'education-advanced',
    type: 'section',
    cardType: CardType.EDUCATION,
    title: '教育背景',
    items: [
      {
        id: 1,
        title: '北京大学1',
        major: '计算机科学与技术',
        degree: '硕士',
        learnMethod: '全日制',
        content: '主修课程：数据结构、算法设计与分析、数据库系统原理等。',
        date: '2018.09 - 2020.06',
        location: '北京'
      },
      {
        id: 2,
        title: '清华大学',
        major: '软件工程',
        learnMethod: '全日制',
        degree: '本科',
        content: '主修课程：软件工程原理、软件项目管理、软件测试等。',
        date: '2014.09 - 2018.06',
        location: '北京'
      }
    ]
  },
  {
    key: 'project',
    type: 'section',
    cardType: CardType.PROJECT,
    title: '项目经历',
    items: [
      {
        id: 1,
        title: '智能简历生成平台',
        role: '前端负责人',
        location: '杭州',
        date: '2021.03 - 2022.12',
        projectLink: 'https://resume.example.com',
        content: '负责简历编辑器、模板渲染和打印链路搭建，完成拖拽排序、模板配置和打印页拆分，提升了生成效率与交付稳定性。'
      },
      {
        id: 2,
        title: '校招岗位聚合系统',
        role: '全栈开发',
        date: '2020.05 - 2020.12',
        location: '上海',
        projectLink: 'https://jobs.example.com',
        content: '独立完成岗位抓取、筛选和投递记录模块，实现关键词检索、收藏管理和项目数据看板，方便求职阶段统一管理信息。'
      }
    ]
  },
  {
    key: 'skills',
    type: 'section',
    cardType: CardType.SKILL,
    title: '技能专长',
    items: [
      {
        id: 1,
        title: '具体性和量化',
        content: '在描述你的技能时，尽量具体和量化。使用数字、百分比或具体的项目经验来支持你的陈述。例如，"成功管理了5个项目，每个项目的预算超过100万美元，并在预定时间内完成了它们"',
      },
      {
        id: 2,
        title: '其他',
        content: '主修课程：软件工程原理、软件项目管理、软件测试等。',
      }
    ]
  },
  {
    key: 'introduction',
    type: 'section',
    cardType: CardType.CUSTOM,
    title: '自我介绍',
    items: [
      {
        id: 1,
        content: '在描述你的技能时，尽量具体和量化。使用数字、百分比或具体的项目经验来支持你的陈述。例如，"成功管理了5个项目，每个项目的预算超过100万美元，并在预定时间内完成了它们"',
      },
    ]
  }
]
