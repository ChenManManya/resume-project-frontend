<script setup lang="ts">
interface PersonalInfo {
    name: string;
    title: string;
    phone: string;
    email: string;
    address: string;
    photo?: string;
    photoReverse?: boolean;
}



const props = withDefaults(
  defineProps<{
    personalInfo: PersonalInfo;
  }>(),
  {
    // 这里必须是 { personalInfo: ... } 结构
    personalInfo: () => ({
      name: "",
      title: "",
      phone: "",
      email: "",
      address: "",
      photo: "",
      photoReverse: false,
    }),
  }
);

</script>
<template>
    <div class="simple_personalInfo">
        <div class="simple_personalInfo_photo">
            <img :src="props.personalInfo.photo" :alt="props.personalInfo.name || '头像'" />
        </div>
        <div class="simple_personalInfo_details">
            <div class="simple_personalInfo_main">
                <div class="name">{{ props.personalInfo.name }}</div>
                <div class="title">求职岗位: {{ props.personalInfo.title }}</div>
            </div>
            <div class="simple_personalInfo_meta">
                <div class="meta-item" v-if="props.personalInfo.phone">
                    <span class="label">电话</span>
                    <span class="value">{{ props.personalInfo.phone }}</span>
                </div>
                <div class="meta-item" v-if="props.personalInfo.email">
                    <span class="label">邮箱</span>
                    <span class="value">{{ props.personalInfo.email }}</span>
                </div>
                <div class="meta-item meta-item--full" v-if="props.personalInfo.address">
                    <span class="label">地址</span>
                    <span class="value">{{ props.personalInfo.address }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.simple_personalInfo{
    // padding: 18px 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 18px;
}
.simple_personalInfo_photo {
    width: 128px;
    height: 128px;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
}
.simple_personalInfo_details {
    flex: 1 1 0%;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.simple_personalInfo_main {
    display: flex;
    flex-direction: column;
    gap: 4px;

    > .name {
        font-weight: 700;
        font-size: var(--resume-title-size, 24px);
        line-height: 1.15;
        color: #111827;
        word-break: break-word;
        overflow-wrap: break-word;
    }

    > .title {
        font-size: calc(var(--resume-body-size, 13px) + 2px);
        letter-spacing: 0.02em;
        color: var(--resume-primary-color, #2563eb);
    }
}

.simple_personalInfo_meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 20px;
}

.meta-item {
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: var(--resume-body-size, 13px);
    line-height: var(--resume-line-height, 1.6);
    color: #374151;
    word-break: break-word;
    overflow-wrap: break-word;

    &--full {
        grid-column: 1 / -1;
    }
}

.label {
    flex-shrink: 0;
    color: #6b7280;
}

.value {
    min-width: 0;
    color: #111827;
}
</style>
