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
  <section class="two-column-card">
    <header class="two-column-card__header">
      <span>{{ props.title }}</span>
    </header>
    <div class="two-column-card__list">
      <article v-for="item in props.items" :key="item.id" class="two-column-card__item">
        <div class="two-column-card__main">
          <div class="two-column-card__title-group">
            <strong>{{ item.title }}</strong>
            <span v-if="cardDisplayConfig.showMajor && item.major">{{ item.major }}</span>
            <span v-if="cardDisplayConfig.showDegree && item.degree">{{ item.degree }}</span>
          </div>
          <span v-if="cardDisplayConfig.showDate && item.date" class="two-column-card__date">{{ item.date }}</span>
        </div>
        <div class="two-column-card__meta">
          <span v-if="cardDisplayConfig.showRole && item.role">{{ item.role }}</span>
          <span v-if="cardDisplayConfig.showSubtitle && item.subtitle">{{ item.subtitle }}</span>
          <span v-if="cardDisplayConfig.showDept && item.dept">{{ item.dept }}</span>
          <span v-if="cardDisplayConfig.showPos && item.pos">{{ item.pos }}</span>
          <span v-if="cardDisplayConfig.showLearnMethod && item.learnMethod">{{ item.learnMethod }}</span>
          <span v-if="cardDisplayConfig.showLocation && item.location">{{ item.location }}</span>
          <a v-if="cardDisplayConfig.showProjectLink && item.projectLink" :href="item.projectLink" target="_blank" rel="noreferrer">{{ item.projectLink }}</a>
        </div>
        <div class="two-column-card__content" v-html="item.content"></div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.two-column-card {
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 1));
  border: 1px solid rgba(148, 163, 184, 0.2);
  break-inside: avoid;
  page-break-inside: avoid;
}

.two-column-card__header {
  margin-bottom: 12px;

  span {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.1);
    color: var(--resume-primary-color, #2563eb);
    font-size: calc(var(--resume-body-size, 13px) - 1px);
    font-weight: 700;
    letter-spacing: 0.05em;
  }
}

.two-column-card__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.two-column-card__item + .two-column-card__item {
  padding-top: 14px;
  border-top: 1px dashed rgba(148, 163, 184, 0.3);
}

.two-column-card__main {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.two-column-card__title-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;

  strong {
    font-size: calc(var(--resume-body-size, 13px) + 1px);
    color: #0f172a;
  }

  span {
    color: #64748b;
    font-size: var(--resume-body-size, 13px);
  }
}

.two-column-card__date,
.two-column-card__meta {
  color: #64748b;
  font-size: var(--resume-body-size, 13px);
}

.two-column-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 6px;

  a {
    color: var(--resume-primary-color, #2563eb);
    text-decoration: none;
  }
}

.two-column-card__content {
  margin-top: 8px;
  color: #111827;
  line-height: var(--resume-line-height, 1.7);

  :deep(p) { margin: 0 0 8px; }
  :deep(ul),
  :deep(ol) {
    margin: 0;
    padding-left: 20px;
  }
}
</style>
