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
    
export interface TemplateTagsGroupPayload {
    [group: string]: string[]
}


export const getTemplateDetails = async (id: number) =>{
    return useHttpGet<TemplatePayload>("templateDetails", `/templates/${id}`)
}

export const getTemplateTagsGroup = async () => {
    return useHttpGet<TemplateTagsGroupPayload>('tag-groups','/templates/tag-groups', {$: true})
}

export const pageTemplates = async (params: {pageNum: number, pageSize: number, tag: string[], category: string}) => {
    return useHttpGet<PageResult<TemplatePayload>>('templates-page','/templates/page', {
      $: true,
      query: {
        page: params.pageNum,
        size: params.pageSize,
        tag: params.tag,
        category: params.category
      }
    })
}
