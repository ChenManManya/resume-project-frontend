<script setup lang="ts">
interface PersonalInfo {
  name: string
  title: string
  phone: string
  email: string
  address: string
  photo?: string
  photoReverse?: boolean
}

const props = withDefaults(defineProps<{ personalInfo: PersonalInfo }>(), {
  personalInfo: () => ({
    name: '',
    title: '',
    phone: '',
    email: '',
    address: '',
    photo: '',
    photoReverse: false
  })
})
</script>

<template>
  <section class="two-column-personal">
    <div class="two-column-personal__identity" :class="{ 'two-column-personal__identity--reverse': props.personalInfo.photoReverse }">
      <div v-if="props.personalInfo.photo" class="two-column-personal__photo">
        <img :src="props.personalInfo.photo" :alt="props.personalInfo.name || '头像'" />
      </div>
      <div class="two-column-personal__headline">
        <h1>{{ props.personalInfo.name }}</h1>
        <p>{{ props.personalInfo.title }}</p>
      </div>
    </div>
    <div class="two-column-personal__meta">
      <div v-if="props.personalInfo.phone" class="two-column-personal__meta-item">
        <span class="label">电话</span>
        <span class="value">{{ props.personalInfo.phone }}</span>
      </div>
      <div v-if="props.personalInfo.email" class="two-column-personal__meta-item">
        <span class="label">邮箱</span>
        <span class="value">{{ props.personalInfo.email }}</span>
      </div>
      <div v-if="props.personalInfo.address" class="two-column-personal__meta-item two-column-personal__meta-item--full">
        <span class="label">地址</span>
        <span class="value">{{ props.personalInfo.address }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.two-column-personal {
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(220px, 0.85fr);
  gap: 20px;
  padding: 22px 24px;
  border-radius: 26px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.96));
  color: #f8fafc;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  box-shadow: 0 20px 36px rgba(15, 23, 42, 0.14);
}

.two-column-personal__identity {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;

  &--reverse {
    flex-direction: row-reverse;
  }
}

.two-column-personal__photo {
  width: 112px;
  height: 112px;
  border-radius: 30px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.two-column-personal__headline {
  min-width: 0;
  flex: 1;

  h1 {
    margin: 0;
    font-size: calc(var(--resume-title-size, 24px) + 6px);
    line-height: 1.08;
    font-weight: 800;
    letter-spacing: 0.02em;
    word-break: break-word;
  }

  p {
    margin: 10px 0 0;
    font-size: calc(var(--resume-body-size, 13px) + 2px);
    color: rgba(226, 232, 240, 0.94);
    word-break: break-word;
  }
}

.two-column-personal__meta {
  display: grid;
  gap: 10px;
  align-content: center;
}

.two-column-personal__meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);

  &--full {
    grid-column: 1 / -1;
  }

  .label {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(191, 219, 254, 0.92);
  }

  .value {
    color: #f8fafc;
    font-size: var(--resume-body-size, 13px);
    line-height: 1.5;
    word-break: break-word;
  }
}

@media (max-width: 720px) {
  .two-column-personal {
    grid-template-columns: 1fr;
  }
}
</style>
