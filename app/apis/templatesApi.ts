export interface TemplatePayload {
    id: number
    name: string
    description: string
    tags: string[]
    previewImageUrl: string
    catgory: string
    schemaJson: string
    styleJson: string
    usageNumaber: number
    defaultContentJson: string
}


export interface UserFavoriteTemplatePayload {
    id: number,
    name: string,
    templateId: number,
    previewImageUrl: string
    createTime: Date
}

    
export interface TemplateTagsGroupPayload {
    [group: string]: string[]
}


export const getTemplateDetails = async (id: number, options: Record<string, unknown> = {}) =>{
    return useHttpGet<TemplatePayload>(`templateDetails:${id}`, `/templates/${id}`, options)
}

export const getTemplateTagsGroup = async () => {
    return useHttpGet<TemplateTagsGroupPayload>('tag-groups','/templates/tag-groups', {$: true})
}

export const pageTemplates = async (params: {pageNum: number, pageSize: number, tag: string[], category?: string, keyword?: string}) => {
    const requestKey = `templates-page:${params.pageNum}:${params.pageSize}:${params.category ?? 'all'}:${params.keyword ?? ''}:${params.tag.join('|')}`

    return useHttpGet<PageResult<TemplatePayload>>(requestKey,'/templates/page', {
      $: true,
      query: {
        page: params.pageNum,
        size: params.pageSize,
        tag: params.tag,
        category: params.category,
        keyword: params.keyword
      }
    })
}

export const getRecommendTemplatesWithUser = async () => {
    return useHttpGet<TemplatePayload[]>(`recommendTemplatesUser`, `/user/templates/recommend`, {
        $: true,
    })
}

export const favoriteTemplate = async (id:number) => {
    return useHttpGet('favoriteTemplate', '/templates/favorite' ,{ 
        $:true,
        query: {
            templateId: id
        }
    })
}


export const checkFavoriteTemplate = async (id:number) => {
    return useHttpGet('checkFavoriteTemplate', '/templates/checkFavoriteTemplate' ,{ 
        $:true,
        query: {
            templateId: id
        }
    })
}
export const pageUserFavoriteTemplate = async (params: {pageNum: number, pageSize: number}) => {
    return useHttpGet('pageUserFavoriteTemplate', '/templates/pageFavorite' ,{ 
        $:true,
        query: {
            page: params.pageNum,
            size: params.pageSize
        }
    })
}

export const getTemplateCategoryies = async () => {
    return useHttpGet<string[]>('templateCategories', '/templates/category', {$: true})
}


export const getRecommendTemplates = async (params: {templateId: number, limit: number}, options: Record<string, unknown> = {}) => {
    return useHttpGet<TemplatePayload[]>(`recommendTemplates:${params.templateId}:${params.limit}`, `/templates/${params.templateId}/recommend`, {
        $: true,
        ...options,
        query: {

            limit: params.limit
        }
    })
}
