export interface ArticlePagePayload {
    articleId: number;
    coverUrl: string;
    viewNum: number;
    title: string;

    content: string;
    publishedTime: string;
    tags: string[];
    status: number;
    createTime: string;
    updateTime: string;
}

export interface ArticleDetailPayload {
    articleId: number;
    coverUrl: string;
    title: string;
    content: string;
    tags: string[];
    viewNum: number;
    status: number;
    publishedTime: string;
    createTime: string;
    updateTime: string;
    createBy: number;
    updateBy: number;
}


export const pageArticles = async (params: { pageNum: number; pageSize: number; tag?: string; keyword?: string }) => {
    const requestKey = `articlesPage:${params.pageNum}:${params.pageSize}:${params.tag ?? 'all'}:${params.keyword ?? ''}`

    return useHttpGet<PageResult<ArticlePagePayload>>(requestKey, '/articles/public/page', {
        $: true,
        query: {
            page: params.pageNum,
            size: params.pageSize,
            tag: params.tag,
            keyword: params.keyword,
        },
    })
}

export const getArticleDetail = async (id: number, options: Record<string, unknown> = {}) => {
    return useHttpGet<ArticleDetailPayload>(`articleDetail:${id}`, `/articles/public/${id}`, options)
}

export const getListTags = async () => {
    return useHttpGet<string[]>('articleTags', '/articles/public/tags', { $: true })
}


export const fetchRecommendArticles = async (params: { articleId: number; limit?: number }) => {
    return useHttpGet<ArticlePagePayload[]>(`recommendArticles:${params.articleId}:${params.limit}`, 
        `/articles/public/${params.articleId}/recommend`, {
            query: {
                limit: params.limit
            },
            $: true
        })
}
