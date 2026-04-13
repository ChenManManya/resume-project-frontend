<script lang="ts" setup>
const props = defineProps({
    article : {
        type: Object,
        required: true,
    }
})

const decodeHtmlEntities = (value: string) => value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")

const articleDesc = computed(() => {
    const content = props.article?.content ?? ''

    return decodeHtmlEntities(String(content)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim())
})

</script>
<template>
   <div class="article-item">
        <div class="article-item-info">
            <h2><NuxtLink class="article-item-title" :to="`/articles/detail/${article.articleId}`">{{ article.title }}</NuxtLink></h2>
            <div class="article-item-desc">{{ articleDesc }}</div>
            <div class="article-item-meta">
                <div class="article-item-meta-tags">
                    <n-tag size="small" type="info" v-for="tag in article.tags" :key="tag">{{ tag }}</n-tag>
                </div>
                <div class="article-item-meta-date">
                    <NuxtTime
                      :datetime="new Date(article.publishedTime)"
                      year="numeric"
                      month="long"
                      day="numeric"
                      hour="2-digit"
                      minute="2-digit"
                      />
                </div>
            </div>
        </div>
        <div class="article-item-cover">
            <img src="" alt="" width="200" height="120">
        </div>
    </div>
</template>
<style lang="scss" scoped>
.article-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: #fff;
    .article-item-info {
        flex: 1;
        margin-right: 20px;
        .article-item-title {
            font-size: 18px;
            font-weight: 800;
            margin-bottom: 10px;
            color: #000;
        }

        .article-item-desc {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            margin-bottom: 15px;
            width: 100%;
            min-height: 67px;
        }

        .article-item-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .article-item-meta-tags {
                display: flex;
                gap: 10px;
            }

            .article-item-meta-date {
                font-size: 12px;
                color: #999;
            }
        }
    }

    .article-item-cover {
        width: 200px;
        height: 120px;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
        }
    }
}
</style>
