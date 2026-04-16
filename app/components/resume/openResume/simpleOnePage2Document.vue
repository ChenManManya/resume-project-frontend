<script setup lang="ts">
import { computed } from 'vue'
import type { ResumeLayoutConfig, ResumeModule } from '~/types/resume'
import { toOpenResumeSimpleDocument } from '~/components/resume/openResume/adapters/simpleOnePage'

const props = defineProps<{ modules: ResumeModule[]; layout?: ResumeLayoutConfig }>()
const documentData = computed(() => toOpenResumeSimpleDocument(props.modules, props.layout))
</script>

<template>
  <section class="open-simple-one-page-2" :style="{ '--open-primary': documentData.primaryColor }">
    <aside class="left">
      <section class="sidebar-item">
        <h3>{{ documentData.baseInfo.title }}</h3>
        <div class="labels"><div v-for="label in documentData.baseInfo.labels" :key="label">{{ label }}</div></div>
      </section>
      <section v-for="item in documentData.sidebar" :key="item.title" class="sidebar-item">
        <h3>{{ item.title }}</h3>
        <div class="labels"><div v-for="label in item.labels" :key="label">{{ label }}</div></div>
      </section>
    </aside>
    <section class="right">
      <header class="header">
        <div class="hello">HELLO<span>°</span></div>
        <div class="name">我是{{ documentData.name }}</div>
      </header>
      <div class="title">工作经历</div>
      <article v-for="item in documentData.workingHistory" :key="`${item.title}-${item.startTime}`" class="work-item">
        <div class="work-top"><strong>{{ item.title }}</strong><span>{{ item.startTime }}<template v-if="item.endTime"> - {{ item.endTime }}</template></span></div>
        <p>{{ item.content }}</p>
      </article>
      <div class="title">自我评价</div>
      <div class="intro">{{ documentData.introduce || '暂无自我评价' }}</div>
    </section>
  </section>
</template>

<style scoped lang="scss">
.open-simple-one-page-2 { width: 100%; min-height: 100%; display: flex; background: #fff; font-size: 15px; line-height: 1.75; }
.left { width: 240px; flex-shrink: 0; background: #0f172a; color: #f8fafc; padding: 64px 24px 32px; }
.left > * + * { margin-top: 28px; }
.sidebar-item h3, .title { display: inline-flex; align-items: center; padding: 4px 12px;  background: rgba(255,255,255,.1); color: inherit; font-size: 14px; font-weight: 700; }
.labels { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.right { flex: 1; min-width: 0; padding: 42px 38px; }
.header .hello { font-size: 40px; font-weight: 800; color: var(--open-primary, #2563eb); }
.header .name { margin-top: 6px; font-size: 28px; font-weight: 700; color: #111827; }
.title { margin-top: 32px; background: rgba(15,23,42,.06); color: var(--open-primary, #2563eb); }
.work-item { padding-top: 16px; }
.work-item + .work-item { margin-top: 8px; border-top: 1px dashed rgba(148,163,184,.28); }
.work-top { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.work-top strong { color: #0f172a; }
.work-top span { color: #64748b; font-size: 13px; }
.work-item p, .intro { margin: 0; color: #334155; white-space: pre-line; }
</style>
