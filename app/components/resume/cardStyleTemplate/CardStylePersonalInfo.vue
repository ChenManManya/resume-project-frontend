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
  <section class="card-style-personal">
    <div class="card-style-personal__head">
      <div class="card-style-personal__photo" v-if="props.personalInfo.photo">
        <img :src="props.personalInfo.photo" :alt="props.personalInfo.name || '头像'" />
      </div>
      <div class="card-style-personal__identity">
        <h1>{{ props.personalInfo.name }}</h1>
        <p>{{ props.personalInfo.title }}</p>
      </div>
    </div>
    <div class="card-style-personal__meta">
      <div v-if="props.personalInfo.phone" class="meta-item"><span>电话</span><strong>{{ props.personalInfo.phone }}</strong></div>
      <div v-if="props.personalInfo.email" class="meta-item"><span>邮箱</span><strong>{{ props.personalInfo.email }}</strong></div>
      <div v-if="props.personalInfo.address" class="meta-item meta-item--full"><span>地址</span><strong>{{ props.personalInfo.address }}</strong></div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.card-style-personal {
  padding: 20px 22px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96));
  border: 1px solid rgba(148,163,184,0.18);
  box-shadow: 0 16px 32px rgba(15,23,42,0.06);
}

.card-style-personal__head {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 16px;
}

.card-style-personal__photo {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(37,99,235,0.12);

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
}

.card-style-personal__identity {
  h1 { margin: 0; font-size: calc(var(--resume-title-size, 24px) + 4px); color: #0f172a; }
  p { margin: 8px 0 0; color: var(--resume-primary-color, #2563eb); font-size: calc(var(--resume-body-size, 13px) + 2px); font-weight: 600; }
}

.card-style-personal__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.meta-item {
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(241,245,249,0.8);
  display: flex;
  flex-direction: column;
  gap: 4px;

  &--full { grid-column: 1 / -1; }
  span { color: #64748b; font-size: 12px; }
  strong { color: #0f172a; font-size: var(--resume-body-size, 13px); word-break: break-word; }
}
</style>
