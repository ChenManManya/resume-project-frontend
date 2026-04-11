
import { createDiscreteApi } from "naive-ui"
import { createResume } from "~/apis/resumeApi"

export const useResume = () => {
    const { message } = createDiscreteApi(["message"]);
    
    const createResumeWithTemplate = async (templateId: number) => {
        message.loading('正在创建简历...')
        const { data, error } = await createResume({ templateId, title: '我的简历' })
        if (error.value) {
            message.error('简历创建失败!')
            return
        }
        message.success('简历创建成功!')
        await navigateTo({
            path: '/maker',
            query: {
                resumeId: data.value?.resumeId,
            }
        })
    }

    return {
        createResumeWithTemplate
    }

}