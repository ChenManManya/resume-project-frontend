<script lang="ts" setup>
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
      return {
        showMajor: true,
        showDegree: true,
        showDate: true,
        showSubtitle: false,
        showLocation: true,
        showLearnMethod: true,
        showDept: false,
        showPos: false
      }
    case CardType.SKILL:
      return {
        showMajor: false,
        showDegree: false,
        showDate: false,
        showSubtitle: false,
        showLocation: false,
        showLearnMethod: false,
        showDept: false,
        showPos: false
      }
    case CardType.PROJECT:
      return {
        showMajor: false,
        showDegree: false,
        showDate: true,
        showSubtitle: false,
        showLocation: false,
        showLearnMethod: false,
        showDept: false,
        showPos: false,
        showRole: true,
        showProjectLink: true
      }
    case CardType.WORK:
      return {
        showMajor: false,
        showDegree: false,
        showDate: true,
        showSubtitle: false,
        showLocation: true,
        showLearnMethod: false,
        showDept: true,
        showPos: true,
        showRole: false,
        showProjectLink: false
      }
    case CardType.CUSTOM:
    default:
      return {
        showMajor: false,
        showDegree: false,
        showDate: true,
        showSubtitle: true,
        showLocation: true,
        showLearnMethod: false,
        showDept: false,
        showPos: false,
        showRole: false,
        showProjectLink: false
      }
  }
})
</script>
<template>
    <div class="simple_card">
        <div class="card-title">
            <span>{{ props.title }}</span>
        </div>
        <div class="card-content">
            <div class="card-content-item" v-for="item in props.items" :key="item.id">
                <div class="card-content-item-header">
                    <div class="card-content-item-header-main" :class="{ 'card-content-item-header-main--education': props.cardType === CardType.EDUCATION }">
                        <div class="card-content-item-header-main-group" :class="{ 'card-content-item-header-main-group--education': props.cardType === CardType.EDUCATION }">
                            <span class="card-content-item-header-title">{{ item.title }}</span>
                            <span class="card-content-item-header-major" v-if="cardDisplayConfig.showMajor && item.major">{{ item.major }}</span>
                            <span class="card-content-item-header-degree" v-if="cardDisplayConfig.showDegree && item.degree">{{ item.degree }}</span>
                        </div>
                        <span class="card-content-item-header-date" v-if="cardDisplayConfig.showDate && item.date">{{ item.date }}</span>
                    </div>
                    <div class="card-content-item-header-meta">
                        <span class="card-content-item-header-role" v-if="cardDisplayConfig.showRole && item.role">{{ item.role }}</span>
                        <span class="card-content-item-header-subtitle" v-if="cardDisplayConfig.showSubtitle && item.subtitle">{{ item.subtitle }}</span>
                        <span class="card-content-item-header-dept" v-if="cardDisplayConfig.showDept && item.dept">{{ item.dept }}</span>
                        <span class="card-content-item-header-pos" v-if="cardDisplayConfig.showPos && item.pos">{{ item.pos }}</span>

                        <span class="card-content-item-header-learn-method" v-if="cardDisplayConfig.showLearnMethod && item.learnMethod">{{ item.learnMethod }}</span>
                        <span class="card-content-item-header-location" v-if="cardDisplayConfig.showLocation && item.location">{{ item.location }}</span>
                        <a class="card-content-item-header-link" v-if="cardDisplayConfig.showProjectLink && item.projectLink" :href="item.projectLink" target="_blank" rel="noreferrer">{{ item.projectLink }}</a>
                    </div>
                </div>
                <div class="card-content-item-content" v-html="item.content"></div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;

    &::before {
        content: '';
        display: block;
        flex-shrink: 0;
        width: 0;
        height: 1em;
        border-left: 4px solid var(--resume-primary-color, #2563eb);
        border-radius: 2px;
    }

    > span {
        display: inline-block;
        font-size: calc(var(--resume-body-size, 13px) + 3px);
        line-height: 1;
        font-weight: 700;
        color: #111827;
    }
}

.card-content {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: calc(var(--resume-section-gap, 20px) * 0.8);
}

.card-content-item-header {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
}

.card-content-item-header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    >.card-content-item-header-title {
        word-break: break-word;
        overflow-wrap: break-word;
        margin: 0px;
        font-weight: bold;
        font-size: calc(var(--resume-body-size, 13px) + 2px);
    }

    &--education {
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
    }
}

.card-content-item-header-main-group {
    display: flex;
    align-items: center;
    min-width: 0;

    &--education {
        gap: 10px;
        flex-wrap: wrap;
    }
}
.card-content-item-header-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    font-size: var(--resume-body-size, 13px);
    color: #6b7280;
}

.card-content-item-header-major, .card-content-item-header-degree, .card-content-item-header-role {

    font-size: var(--resume-body-size, 13px);
    color: #6b7280;
}

.card-content-item-header-link {
    color: #2563eb;
    text-decoration: none;
    word-break: break-all;
}

.card-content-item-content {
    line-height: var(--resume-line-height, 1.7);
    color: #111827;

    :deep(p) {
        margin: 0 0 8px;
    }

    :deep(ul),
    :deep(ol) {
        margin: 0;
        padding-left: 20px;
    }

    :deep(li + li) {
        margin-top: 4px;
    }
}
</style>
