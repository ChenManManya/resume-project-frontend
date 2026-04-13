<script lang="ts" setup>
import { ref, watch } from 'vue'
import { getListTags, pageArticles, type ArticlePagePayload } from '~/apis/articlesApi';

const page = ref(1)
const activeTab = ref('all')
const articles: ArticlePagePayload[] = ref([])
const listTags = ref<string[]>([])
const totalArticles = ref(0)
const pageSize = 10

const fetchArticles = async () => {
    const {data} = await pageArticles({
        pageNum: page.value,
        pageSize,
        tag: activeTab.value === 'all' ? undefined : activeTab.value
     })
    articles.value = data.value?.list ?? []
    totalArticles.value = data.value?.total ?? 0
}

const fetchListTags = async () => {
    const { data } = await getListTags()
    listTags.value = data.value ?? []
}

await Promise.all([fetchArticles(), fetchListTags()])

const handleTabChange = async (tab: string) => {
    if (activeTab.value === tab) {
        return
    }

    activeTab.value = tab
    page.value = 1
    await fetchArticles()
}

watch(page, async (currentPage, previousPage) => {
    if (currentPage === previousPage) {
        return
    }

    await fetchArticles()
})


</script>

<template>
    <div class="articles-page">
        <AppTopNav />
        <main class="articles-main">
            <div class="articles-content ">
                <div class="articles-header">
                    <n-card  size="small" :bordered="false">
                        <div class="articles-tabs-scroll">
                            <n-tabs :value="activeTab" type="line" animated @update:value="handleTabChange">
                                <n-tab name="all" tab="全部" />
                                <n-tab v-for="tag in listTags" :key="tag" :name="tag" :tab="tag" />
                            </n-tabs>
                        </div>
                    </n-card>
                </div>
                <div class="articles-list">
                    <ArticleCard v-show="articles.length > 0" v-for="article in articles" :key="article.articleId" :article="article" />
                    <n-empty v-show="articles.length === 0" style="padding: 10px;" description="暂无文章" />
                </div>
                <n-pagination class="article-pagination" v-model:page="page" :page-size="pageSize" :item-count="totalArticles" />
            </div>
            <div class="articles-sidebar">
                <n-card title="推荐阅读" size="huge" :bordered="false">
                    <n-list>
                        <n-list-item v-for="i in 5" :key="i">
                            <n-skeleton :width="'100%'" :height="20" />
                        </n-list-item>
                    </n-list>
                </n-card>
            </div>
        </main>
    </div>
</template>
<style lang="scss" scoped>

.articles-page {
  min-height: 100vh;
  background-color: #F4F3FB;
}

.section-box {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.articles-main {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
  padding: 36px 0 72px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;

  > * {
    min-width: 0;
  }
}

.articles-content {

    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 5px;
    min-width: 0;

    >.articles-header {
        border-radius: 10px;
        min-width: 0;

        .articles-tabs-scroll {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: thin;

            :deep(.n-tabs) {
                min-width: 0;
                max-width: 100%;
            }

            :deep(.n-tabs-nav) {
                min-width: 100%;
            }

            :deep(.n-tabs-nav-scroll-wrapper) {
                max-width: 100%;
                overflow: hidden;
            }

            :deep(.n-tabs-nav-scroll-content) {
                width: max-content;
                min-width: 100%;
            }

            :deep(.n-tabs-wrapper) {
                min-width: 0;
            }

            :deep(.n-tabs-tab-wrapper) {
                flex-wrap: nowrap;
            }

            :deep(.n-tabs-tab) {
                flex: 0 0 auto;
                white-space: nowrap;
            }
        }
    }
    >.articles-list {
        background-color: #fff;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
}


.articles-sidebar {
    display: flex;
    border-radius: 10px;
    flex-direction: column;
    gap: 20px;
    >.n-card {
        border-radius: 10px;
    }
}
</style>
