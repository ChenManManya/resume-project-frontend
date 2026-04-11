<script setup lang="ts">

const props = defineProps<{
    title: string,
    imgUrl: string | undefined,
    tags: string[]
}>()


</script>
<template>
    <div class="resume-card-new">
        <div class="resume-card-image">
            <div class="resume-card-image-mask">
                <div class="resume-card-preview">
                    <n-icon size="40">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M22 12c-2.667 4.667-6 7-10 7s-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7"></path></g></svg>
                    </n-icon>
                    <span>进入查看</span>
                </div>
            </div>
            <img :src="props.imgUrl" :alt="props.title">
        </div>
        <footer class="resume-card-footer">
            <div class="resume-card-title">{{ props.title }}</div>
            <div class="resume-card-tags">
                <n-tag :bordered="false" type="info" :key="tag" v-for="tag in props.tags" >
                    {{ tag }}
                </n-tag>
            </div>
        </footer>
    </div>
</template>
<style lang="scss" scoped>
.resume-card-new {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 300px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 450px;
    position: relative;
    border-radius: 5px;
    >.resume-card-image {
        width: 100%;
        height: 500px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
        > .resume-card-image-mask {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            > .resume-card-preview {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                color: #fff;
                font-size: 18px;
                font-weight: 500;
                background-color: rgba(0, 0, 0, 0.5);
                opacity: 0;
                
            }

        }
    }

  &:hover {
    .resume-card-image-mask {
      background-color: rgba(0, 0, 0, 0.2);
      .resume-card-preview {
        opacity: 1;
      }
    }
  }

    >.resume-card-footer {
        margin-top: 12px;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: left;
        padding: 10px;
        background-color: #fff;
        position: absolute;
        bottom: 0;
        gap: 5px;
        .resume-card-title {
            font-size: 18px;
            font-weight: 500;
            color: #111827;
        }

        .resume-card-tags {
            display: flex;
            gap: 5px;
        }
    }
    &:hover {
        transition: all 1s ease;
        transform: translateY(-5px);
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
}
</style>
