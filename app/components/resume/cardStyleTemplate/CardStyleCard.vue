<script setup lang="ts">
import { computed } from 'vue'
import CardType from '~/enums/cardEnum'
import type { ResumeCardItem } from '~/types/resume'

interface ResumeCardProps {
  title: string
  cardType?: CardType
  items?: ResumeCardItem[]
}

const props = withDefaults(defineProps<ResumeCardProps>(), {
  title: '',
  cardType: CardType.CUSTOM,
  items: () => []
})

const cardDisplayConfig = computed(() => {
  switch (props.cardType) {
    case CardType.EDUCATION:
      return { showMajor: true, showDegree: true, showDate: true, showSubtitle: false, showLocation: true, showLearnMethod: true, showDept: false, showPos: false, showRole: false, showProjectLink: false }
    case CardType.SKILL:
      return { showMajor: false, showDegree: false, showDate: false, showSubtitle: false, showLocation: false, showLearnMethod: false, showDept: false, showPos: false, showRole: false, showProjectLink: false }
    case CardType.PROJECT:
      return { showMajor: false, showDegree: false, showDate: true, showSubtitle: false, showLocation: false, showLearnMethod: false, showDept: false, showPos: false, showRole: true, showProjectLink: true }
    case CardType.WORK:
      return { showMajor: false, showDegree: false, showDate: true, showSubtitle: false, showLocation: true, showLearnMethod: false, showDept: true, showPos: true, showRole: false, showProjectLink: false }
    default:
      return { showMajor: false, showDegree: false, showDate: true, showSubtitle: true, showLocation: true, showLearnMethod: false, showDept: false, showPos: false, showRole: false, showProjectLink: false }
  }
})
</script>

<template>
  <section class="card-style-card">
    <header class="card-style-card__header"><span>{{ props.title }}</span></header>
    <div class="card-style-card__list">
      <article v-for="item in props.items" :key="item.id" class="card-style-card__item">
        <div class="card-style-card__top">
          <div class="card-style-card__title-group">
            <strong>{{ item.title }}</strong>
            <span v-if="cardDisplayConfig.showMajor && item.major">{{ item.major }}</span>
            <span v-if="cardDisplayConfig.showDegree && item.degree">{{ item.degree }}</span>
          </div>
          <span v-if="cardDisplayConfig.showDate && item.date" class="card-style-card__date">{{ item.date }}</span>
        </div>
        <div class="card-style-card__meta">
          <span v-if="cardDisplayConfig.showRole && item.role">{{ item.role }}</span>
          <span v-if="cardDisplayConfig.showSubtitle && item.subtitle">{{ item.subtitle }}</span>
          <span v-if="cardDisplayConfig.showDept && item.dept">{{ item.dept }}</span>
          <span v-if="cardDisplayConfig.showPos && item.pos">{{ item.pos }}</span>
          <span v-if="cardDisplayConfig.showLearnMethod && item.learnMethod">{{ item.learnMethod }}</span>
          <span v-if="cardDisplayConfig.showLocation && item.location">{{ item.location }}</span>
          <a v-if="cardDisplayConfig.showProjectLink && item.projectLink" :href="item.projectLink" target="_blank" rel="noreferrer">{{ item.projectLink }}</a>
        </div>
        <div class="card-style-card__content" v-html="item.content"></div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.card-style-card {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 20px 22px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.92));
  border: 1px solid rgba(226,232,240,0.88);
  box-shadow: 0 18px 30px rgba(15,23,42,0.05);
  break-inside: avoid;
  page-break-inside: avoid;
}

.card-style-card__header {
  margin-bottom: 14px;
  span { font-size: calc(var(--resume-body-size, 13px) + 5px); font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
}

.card-style-card__list { display: flex; flex-direction: column; gap: 14px; }

.card-style-card__item {
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248,250,252,0.86), rgba(255,255,255,0.98));
  border: 1px solid rgba(226,232,240,0.86);
}

.card-style-card__top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.card-style-card__title-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
  min-width: 0;
  flex: 1;
  strong { color: #111827; font-size: calc(var(--resume-body-size, 13px) + 2px); }
  span { color: #64748b; }
}

.card-style-card__date,
.card-style-card__meta { color: #64748b; font-size: var(--resume-body-size, 13px); }

.card-style-card__date {
  flex-shrink: 0;
  text-align: right;
  max-width: 100%;
  word-break: break-word;
}

.card-style-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 6px;
  word-break: break-word;
  a { color: var(--resume-primary-color, #2563eb); text-decoration: none; overflow-wrap: anywhere; }
}

.card-style-card__content {
  margin-top: 10px;
  color: #111827;
  line-height: var(--resume-line-height, 1.7);
  word-break: break-word;
  :deep(p) { margin: 0 0 8px; }
  :deep(ul),
  :deep(ol) { margin: 0; padding-left: 20px; }
}

@media (max-width: 720px) {
  .card-style-card__top {
    flex-direction: column;
  }

  .card-style-card__date {
    text-align: left;
  }
}
</style>
