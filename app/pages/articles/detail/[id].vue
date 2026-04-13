
<script lang="ts" setup>
import { getArticleDetail, type ArticleDetailPayload } from '~/apis/articlesApi';
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

interface TocItem {
    id: string
    level: number
    text: string
}

const articleBodyRef = ref<HTMLElement | null>(null)
const copyButtonTimers = new Map<HTMLButtonElement, ReturnType<typeof setTimeout>>()

const route = useRoute()

const emptyArticleDetail = (): ArticleDetailPayload => ({
    articleId: 0,
    title: '',
    content: '',
    createBy: 0,
    publishedTime: '',
    coverUrl: '',
    tags: [],
    status: 0,
    viewNum: 0,
    createTime: '',
    updateTime: '',
    updateBy: 0
})

const rawArticleId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const articleId = Number(rawArticleId)

if (!Number.isInteger(articleId) || articleId <= 0) {
    throw createError({
        statusCode: 400,
        statusMessage: '无效的文章 ID'
    })
}

const { data: articleDetail } = await useAsyncData(
    `article-detail:${articleId}`,
    async () => {
        const { data, error } = await getArticleDetail(articleId, { $: true })

        if (error.value) {
            throw createError({
                statusCode: 500,
                statusMessage: '文章详情加载失败'
            })
        }

        return data.value ?? emptyArticleDetail()
    }
)

const stripHtmlTags = (value: string) => value.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim()

const slugifyHeading = (value: string, fallbackIndex: number) => {
    const normalized = value
        .toLowerCase()
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
        .replace(/^-+|-+$/g, '')

    return normalized || `heading-${fallbackIndex}`
}

const parsedArticle = computed(() => {
    const content = articleDetail.value?.content ?? ''

    if (!content) {
        return {
            html: '',
            tocItems: [] as TocItem[]
        }
    }

    const usedIds = new Set<string>()
    const tocItems: TocItem[] = []
    let headingIndex = 0

    const html = content.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_, levelText: string, rawAttrs: string, innerHtml: string) => {
        headingIndex += 1
        const level = Number(levelText)
        const text = stripHtmlTags(innerHtml)
        const idMatch = rawAttrs.match(/\sid=(['"])(.*?)\1/i)
        const baseId = idMatch?.[2] || slugifyHeading(text, headingIndex)

        let headingId = baseId
        let duplicateIndex = 1

        while (usedIds.has(headingId)) {
            duplicateIndex += 1
            headingId = `${baseId}-${duplicateIndex}`
        }

        usedIds.add(headingId)
        tocItems.push({
            id: headingId,
            level,
            text: text || `标题 ${headingIndex}`
        })

        const attrsWithoutId = rawAttrs.replace(/\sid=(['"])(.*?)\1/i, '')
        return `<h${level}${attrsWithoutId} id="${headingId}">${innerHtml}</h${level}>`
    })

    return {
        html,
        tocItems
    }
})

const articleHtml = computed(() => parsedArticle.value.html)
const articleToc = computed(() => parsedArticle.value.tocItems)

const formatCodeLanguage = (code: HTMLElement) => {
    const languageClass = Array.from(code.classList).find((className) => className.startsWith('language-') || className.startsWith('lang-'))

    if (!languageClass) {
        return 'TEXT'
    }

    const rawLanguage = languageClass.replace(/^language-/, '').replace(/^lang-/, '')

    return rawLanguage
        .split(/[-_]/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
}

const createLineNumbersElement = (codeText: string) => {
    const lineNumbers = document.createElement('span')
    lineNumbers.className = 'article-code-lines'
    lineNumbers.setAttribute('aria-hidden', 'true')

    const lineCount = Math.max(codeText.split('\n').length, 1)

    for (let index = 1; index <= lineCount; index += 1) {
        const line = document.createElement('span')
        line.textContent = String(index)
        lineNumbers.appendChild(line)
    }

    return lineNumbers
}

const updateCopyButtonState = (button: HTMLButtonElement, label: string) => {
    const pendingTimer = copyButtonTimers.get(button)

    if (pendingTimer) {
        clearTimeout(pendingTimer)
    }

    button.textContent = label

    const timer = setTimeout(() => {
        button.textContent = '复制'
        copyButtonTimers.delete(button)
    }, 1800)

    copyButtonTimers.set(button, timer)
}

const enhanceArticleCodeBlocks = () => {
    if (!articleBodyRef.value) {
        return
    }

    articleBodyRef.value.querySelectorAll('pre').forEach((preElement) => {
        const pre = preElement as HTMLPreElement
        const code = pre.querySelector('code')

        if (!code) {
            return
        }

        if (!pre.dataset.codeEnhanced) {
            pre.dataset.codeEnhanced = 'true'

            const codeText = code.textContent ?? ''
            const languageBadge = document.createElement('span')
            languageBadge.className = 'article-code-language'
            languageBadge.textContent = formatCodeLanguage(code)

            pre.insertBefore(languageBadge, code)
            pre.insertBefore(createLineNumbersElement(codeText), code)
        }

        if (!pre.querySelector('.article-code-copy')) {
            const copyButton = document.createElement('button')
            copyButton.type = 'button'
            copyButton.className = 'article-code-copy'
            copyButton.textContent = '复制'

            copyButton.addEventListener('click', async () => {
                const codeText = code.textContent ?? ''

                if (!codeText) {
                    updateCopyButtonState(copyButton, '无内容')
                    return
                }

                try {
                    await navigator.clipboard.writeText(codeText)
                    updateCopyButtonState(copyButton, '已复制')
                } catch {
                    updateCopyButtonState(copyButton, '复制失败')
                }
            })

            pre.appendChild(copyButton)
        }
    })
}

const highlightArticleCode = async () => {
    if (!import.meta.client) {
        return
    }

    await nextTick()

    articleBodyRef.value?.querySelectorAll('pre code').forEach((block) => {
        const codeBlock = block as HTMLElement

        if (codeBlock.dataset.highlighted === 'yes') {
            return
        }

        hljs.highlightElement(codeBlock)
    })

    enhanceArticleCodeBlocks()
}

onMounted(() => {
    highlightArticleCode()
})

watch(articleHtml, () => {
    highlightArticleCode()
})

onBeforeUnmount(() => {
    copyButtonTimers.forEach((timer) => {
        clearTimeout(timer)
    })
    copyButtonTimers.clear()
})

</script>
<template>
    <div class="article-details-page">
        <AppTopNav />
        <main class="article-details-main">
            <div class="article-content">
                <div class="article-content-meta">
                    <h1 class="article-title">{{ articleDetail?.title }}</h1>
                    <div class="article-meta">
                        <span>作者：{{ articleDetail?.createBy }}</span>
                        <span>发布时间：{{ articleDetail?.publishedTime }}</span>
                        <span>阅读量：{{ articleDetail?.viewNum }}</span>
                    </div>
                </div>
                <div ref="articleBodyRef" class="article-content-main" v-html="articleHtml">

                </div>
            </div>
            <div class="article-details-sidebar">
                <n-card title="目录" size="small" :bordered="false" class="article-details-catelog">
                    <div v-if="articleToc.length" class="article-toc">
                        <a
                            v-for="item in articleToc"
                            :key="item.id"
                            :href="`#${item.id}`"
                            class="article-toc__item"
                            :style="{ '--toc-level': String(item.level) }"
                        >
                            {{ item.text }}
                        </a>
                    </div>
                    <n-empty
                        v-else
                        size="small"
                        description="文章暂无标题"
                    />
                </n-card>
            
            </div>
        </main>
    </div>
</template>

<style lang="scss" scoped>
.article-details-page {
    min-height: 100vh;
    background-color: #F4F3FB;
    >.article-details-main {
        width: min(1200px, calc(100% - 32px));
        margin: 0 auto;
        padding: 36px 0 72px;
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        >.article-content {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 5px;
            >.article-content-meta {
                border-radius: 10px;
                background-color: #fff;
                padding: 20px;
                >.article-title {
                    margin: 0;
                    font-size: 28px;
                    color: #111827;
                }
                >.article-meta {
                    margin-top: 10px;
                    display: flex;
                    gap: 20px;
                    color: #475569;
                    font-size: 14px;
                }
            }
            >.article-content-main {
                background-color: #fff;
                border-radius: 10px;
                padding: 28px 32px;
                color: #1f2937;
                font-size: 16px;
                line-height: 1.9;

                :deep(> * + *) {
                    margin-top: 1.2em;
                }

                :deep(p) {
                    color: #334155;
                    line-height: 1.95;
                    word-break: break-word;
                }

                :deep(h1),
                :deep(h2),
                :deep(h3),
                :deep(h4),
                :deep(h5),
                :deep(h6) {
                    margin-bottom: 0.7em;
                    color: #0f172a;
                    font-weight: 700;
                    line-height: 1.35;
                    scroll-margin-top: 96px;
                }

                :deep(h1),
                :deep(h2) {
                    padding-bottom: 0.35em;
                    border-bottom: 1px solid rgba(148, 163, 184, 0.25);
                }

                :deep(h1) {
                    font-size: 2rem;
                }

                :deep(h2) {
                    font-size: 1.65rem;
                }

                :deep(h3) {
                    font-size: 1.35rem;
                }

                :deep(h4) {
                    font-size: 1.15rem;
                }

                :deep(ul),
                :deep(ol) {
                    margin: 1.1em 0;
                    padding-left: 1.6em;
                    color: #334155;
                }

                :deep(ul) {
                    list-style: disc;
                }

                :deep(ol) {
                    list-style: decimal;
                }

                :deep(li) {
                    margin: 0.45em 0;
                }

                :deep(li > ul),
                :deep(li > ol) {
                    margin-top: 0.45em;
                    margin-bottom: 0.45em;
                }

                :deep(a) {
                    color: #2563eb;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    word-break: break-word;
                }

                :deep(blockquote) {
                    margin: 1.4em 0;
                    padding: 16px 18px;
                    color: #475569;
                    border-left: 4px solid rgba(37, 99, 235, 0.55);
                    background: linear-gradient(180deg, rgba(239, 246, 255, 0.75), rgba(248, 250, 252, 0.9));
                    border-radius: 0 12px 12px 0;
                }

                :deep(hr) {
                    margin: 2em 0;
                    border: none;
                    border-top: 1px solid rgba(148, 163, 184, 0.3);
                }

                :deep(img) {
                    margin: 1.5em auto;
                    border-radius: 14px;
                    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
                }

                :deep(pre) {
                    margin: 1.4em 0;
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 46px 20px 18px;
                    overflow-x: auto;
                    position: relative;
                    border-radius: 14px;
                    background: #0f172a;
                    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
                }

                :deep(pre code) {
                    display: block;
                    flex: 1;
                    min-width: max-content;
                    padding: 0 20px 0 0;
                    font-size: 14px;
                    line-height: 1.75;
                    background: transparent;
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                }

                :deep(.article-code-language) {
                    position: absolute;
                    top: 12px;
                    left: 16px;
                    z-index: 1;
                    padding: 5px 10px;
                    border-radius: 999px;
                    background: rgba(30, 41, 59, 0.92);
                    color: #cbd5e1;
                    font-size: 12px;
                    line-height: 1;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                }

                :deep(.article-code-lines) {
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                    min-width: 32px;
                    padding-right: 12px;
                    color: rgba(148, 163, 184, 0.7);
                    text-align: right;
                    border-right: 1px solid rgba(148, 163, 184, 0.18);
                    user-select: none;

                    > span {
                        display: block;
                        font-size: 13px;
                        line-height: 1.75;
                    }
                }

                :deep(.article-code-copy) {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    z-index: 1;
                    min-width: 56px;
                    padding: 5px 10px;
                    border: 1px solid rgba(148, 163, 184, 0.28);
                    border-radius: 999px;
                    background: rgba(15, 23, 42, 0.82);
                    color: #e2e8f0;
                    font-size: 12px;
                    line-height: 1;
                    cursor: pointer;
                    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

                    &:hover {
                        background: rgba(30, 41, 59, 0.96);
                        border-color: rgba(96, 165, 250, 0.45);
                        transform: translateY(-1px);
                    }
                }

                :deep(:not(pre) > code) {
                    padding: 0.18em 0.45em;
                    color: #be123c;
                    font-size: 0.92em;
                    background: rgba(244, 63, 94, 0.08);
                    border-radius: 6px;
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                }

                :deep(table) {
                    width: 100%;
                    margin: 1.4em 0;
                    border-collapse: collapse;
                    overflow: hidden;
                    border-radius: 12px;
                    border: 1px solid rgba(148, 163, 184, 0.24);
                }

                :deep(th),
                :deep(td) {
                    padding: 12px 14px;
                    text-align: left;
                    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
                }

                :deep(th) {
                    color: #0f172a;
                    font-weight: 600;
                    background: rgba(248, 250, 252, 0.9);
                }

                :deep(tbody tr:last-child td) {
                    border-bottom: none;
                }
            }
        }

        >.article-details-sidebar {
            position: sticky;
            top: 88px;
            align-self: start;
        }
    }
}

.article-toc {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.article-toc__item {
    display: block;
    padding: 6px 0 6px calc((var(--toc-level, 1) - 1) * 14px);
    color: #475569;
    font-size: 14px;
    line-height: 1.6;
    text-decoration: none;
    border-left: 2px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

    &:hover {
        color: #2563eb;
        border-left-color: rgba(37, 99, 235, 0.3);
        transform: translateX(2px);
    }
}

@media (max-width: 960px) {
    .article-details-page {
        >.article-details-main {
            grid-template-columns: 1fr;

            >.article-details-sidebar {
                position: static;
            }

            >.article-content {
                >.article-content-main {
                    padding: 24px 20px;
                }
            }
        }
    }
}
.article-details-catelog {
    max-height: 480px;
    overflow: scroll;
}
</style>
