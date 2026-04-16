<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

import AppTopNav from '~/components/AppTopNav.client.vue'
import { logout } from '~/apis/authApi'
import { getUserProfile, updateUserProfile, uploadAvatar } from '~/apis/userApi'
import { myResumesList, type MyResumePayload, renameResume, removeResume } from '~/apis/resumeApi'
import type { UploadFileInfo,UploadCustomRequestOptions } from 'naive-ui'
import { getRecommendTemplatesWithUser } from '~/apis/templatesApi'

const menuItems = [
  { key: 'profile', label: '基本信息' },
  { key: 'resumes', label: '我的简历' }
]

const showRenameModal = ref(false)
const activeTab = ref<'profile' | 'resumes'>('profile')
const avatarFile = ref<File | null>(null)
const profileLoading = ref(false)
const profileSubmitting = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const resumesLoading = ref(false)
const resumesError = ref('')
const resumePage = ref(1)
const resumePageSize = 4
const resumeTotal = ref(0)
const initialProfile = ref<Record<string, any> | null>(null)
const { $message }:any = useNuxtApp()
const avatarfileList = ref<UploadFileInfo[]>([

])

useHead({
  title: '个人中心 - 慢慢简历'
})

const profile = reactive({
  id: '',
  username: '',
  nickname: '',
  email: '',
  phoneNumber: '',
  employmentStatus: 0,
  avatar: '/image.png'
})

const renameForm = reactive({
  resumeId: 0,
  newTitle: ''
})

const employmentOptions = [
  { label: '在职', value: 1 },
  { label: '离职可到岗', value: 2 },
  { label: '在校 / 实习', value: 3 },
  { label: '自由职业', value: 4 }
]

const myResumeList: any = ref<MyResumePayload[]>([])

const syncProfile = (data: any) => {
  profile.id = String(data.id ?? '')
  profile.username = data.username ?? ''
  profile.nickname = data.nickname ?? '无名氏'
  profile.email = data.email ?? ''
  profile.phoneNumber = data.phoneNumber ?? ''
  profile.employmentStatus = data.employmentStatus ?? 0
  profile.avatar = data.avatar || '/image.png'
  avatarfileList.value = [{
    id: 'avatar-' + profile.id, 
    name: profile.nickname, 
    url: profile.avatar,
    status: 'finished'
  }]
  initialProfile.value = {
    id: profile.id,
    username: profile.username,
    nickname: profile.nickname,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    employmentStatus: profile.employmentStatus,
    avatar: profile.avatar
  }
}

const loadProfile = async () => {
  profileLoading.value = true
  profileError.value = ''
  profileSuccess.value = ''

  try {
    const { data, error } = await getUserProfile()

    if (error.value || !data.value) {
      throw new Error(error.value || '获取个人信息失败')
    }

    syncProfile(data.value)
  } catch (error: any) {
    profileError.value = error?.statusMessage || error?.message || '获取个人信息失败'
  } finally {
    profileLoading.value = false
  }
}

const submitProfile = async () => {
  profileSubmitting.value = true
  profileError.value = ''
  profileSuccess.value = ''

  try {
    const {data, error} = await updateUserProfile({
      nickname: profile.nickname,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      employmentStatus: profile.employmentStatus,
      avatar: profile.avatar
    })

    if (error.value || !data.value) {
      throw new Error(error.value || '更新个人信息失败')
    }

    syncProfile(data.value)
    profileSuccess.value = '个人信息已更新'
  } catch (error: any) {
    profileError.value = error?.message || '更新个人信息失败'
  } finally {
    profileSubmitting.value = false
  }
}

const resetProfile = () => {
  if (!initialProfile.value) return

  profile.nickname = initialProfile.value.nickname
  profile.email = initialProfile.value.email
  profile.phoneNumber = initialProfile.value.phoneNumber
  profile.employmentStatus = initialProfile.value.employmentStatus
  profile.avatar = initialProfile.value.avatar
  avatarFile.value = null
}

const handleLogout = async () => {
  await logout()
  await navigateTo('/login')
}


const beforeUpload = async (
  data:{
      file: UploadFileInfo,
      fileList: UploadFileInfo[]
  }
) => {
  const allowedFileType = ['image/jpg','image/png','image/jpeg']
  if (allowedFileType.findIndex(ele => data.file.file?.type == ele) == -1) {
    $message.error('只能上传jpg/png格式的图片文件，请重新上传')
    return false
  }
  avatarfileList.value.splice(0, avatarfileList.value.length, )
  return true
}

const handleCustomUpload = async ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
  try {
    const rawFile = file.file as File;
    const {data,error} = await uploadAvatar(rawFile);
    const avatarUrl = `${fetchConfig.baseURL}${data.value}`
    file.url = avatarUrl;
    profile.avatar = avatarUrl;
    onFinish()
  } catch (err) {
    $message.error('头像上传失败，请重试')
    onError()
  }
}

const handleUploadFinish = ({ file }: { file: UploadFileInfo }) => {
  console.log('handleUploadFinish avatarfileList', avatarfileList.value)
  profile.avatar = file.url || profile.avatar
}

const getMyResumesList = async () => {
  resumesLoading.value = true
  resumesError.value = ''

  try {
    const {data,error} : { data: any, error: any } = await myResumesList({
      pageNum: resumePage.value,
      pageSize: resumePageSize
    })
    if (error.value) {
      throw new Error(error.value || '获取我的简历列表失败')
    }

    myResumeList.value = data.value?.list || []
    resumeTotal.value = data.value?.total || 0
  } catch (error: any) {
    resumesError.value = error?.message || '获取我的简历列表失败'
    myResumeList.value = []
    resumeTotal.value = 0
  } finally {
    resumesLoading.value = false
  }
}

const handleResumePageChange = async (page: number) => {
  if (resumePage.value === page) {
    return
  }

  resumePage.value = page
  await getMyResumesList()
}

const openResume = async (resumeId: number) => {
  await navigateTo(`/maker?resumeId=${resumeId}`)
}

const handleRename = (resumeId: number) => {
  renameForm.resumeId = Number(resumeId)
  showRenameModal.value = true
}

const recommendTemplates = ref<any[]>([])
const fetchRecommendTemplates = async () => {
  const {data,error} : { data: any, error: any } = await getRecommendTemplatesWithUser()
  if (data.value) {
    recommendTemplates.value = data.value
  }
}

const handleRenameConfirm = async () => {
  if (!renameForm.newTitle.trim()) {
    $message.warning('简历名字不能为空')
    return
  }

  try {
    const {data,error} = await renameResume(renameForm.resumeId, renameForm.newTitle.trim())
    if (error.value) {
      throw new Error(error.value || '修改简历名字失败')
    }

    $message.success('简历名字修改成功')
    showRenameModal.value = false
    await getMyResumesList()
  } catch (error: any) {
    $message.error(error?.message || '修改简历名字失败')
  }

}
  
const deleteResume = async (resumeId: number) => {
  if (!confirm('确定要删除这份简历吗？此操作无法撤销')) {
    return
  }

  try {
    const {data, error} : { data: any, error: any } = await removeResume(resumeId)
    if (error.value) {
      throw new Error(error.value || '删除简历失败')
    }

    $message.success('简历删除成功')
    await getMyResumesList()
  } catch (error: any) {
    $message.error(error?.message || '删除简历失败')
  }
}

onMounted(() => {
  void loadProfile()
  void getMyResumesList()
  void fetchRecommendTemplates()
})
</script>

<template>
  <div class="personal-page">
    <AppTopNav />
    <div class="personal-shell">
      <aside class="personal-sidebar">
        <div class="profile-card">
          <div class="profile-card__avatar">
            <img :src="profile.avatar" :alt="profile.nickname" />
          </div>
          <strong>{{ profile.nickname }}</strong>
          <span>ID: {{ profile.id }}</span>
          <n-button quaternary @click="handleLogout">退出登录</n-button>
        </div>

        <div class="profile-menu">
          <button
            v-for="item in menuItems"
            :key="item.key"
            class="profile-menu__item"
            :class="{ 'is-active': activeTab === item.key }"
            type="button"
            @click="activeTab = item.key as 'profile' | 'resumes'"
          >
            {{ item.label }}
          </button>
        </div>
      </aside>

      <main class="personal-main">
        <section v-if="activeTab === 'profile'" class="personal-panel personal-panel--profile">
          <div class="personal-banner">
            <div>
              <span>个人信息</span>
              <h1>基本信息</h1>
            </div>
          </div>

          <div class="profile-form-layout">
            <div class="profile-form">
              <div class="profile-id-row">
                <span>ID：</span>
                <strong>{{ profile.id }}</strong>
              </div>

              <n-alert v-if="profileError" type="error" :show-icon="false">
                {{ profileError }}
              </n-alert>

              <n-alert v-if="profileSuccess" type="success" :show-icon="false">
                {{ profileSuccess }}
              </n-alert>

              <label>
                <span>用户名</span>
                <n-input :value="profile.username" readonly />
              </label>

              <label>
                <span>昵称</span>
                <n-input v-model:value="profile.nickname" />
              </label>

              <label>
                <span>邮箱</span>
                <n-input v-model:value="profile.email" placeholder="请输入邮箱" />
              </label>

              <label>
                <span>手机号</span>
                <n-input v-model:value="profile.phoneNumber" placeholder="请输入手机号" />
              </label>

              <label>
                <span>就业状态</span>
                <ClientOnly>
                  <n-select v-model:value="profile.employmentStatus" :options="employmentOptions" />
                </ClientOnly>
              </label>

              <div class="profile-form__actions">
                <n-button type="primary" :loading="profileSubmitting" @click="submitProfile">提交</n-button>
                <n-button :disabled="profileSubmitting" @click="resetProfile">重置</n-button>
              </div>
            </div>

            <div class="profile-avatar-panel">
              <n-upload
                  @before-upload="beforeUpload"
                  :custom-request="handleCustomUpload"
                  @finish="handleUploadFinish"
                  list-type="image-card"
                  v-model:file-list="avatarfileList"
                  :max="1"       
                >
                <div v-if="!avatarfileList.length" class="upload-placeholder">
                  <span>上传头像</span>
                </div>
              </n-upload>
            </div>
          </div>
        </section>

        <section v-else class="personal-panel personal-panel--resumes">
          <div class="resume-board__header">
            <div>
              <span>我的简历</span>
            </div>
            <NuxtLink class="resume-board__more" to="/templates">更多模板 &gt;&gt;</NuxtLink>
          </div>

          <div class="resume-board">
            <aside class="resume-board__list">
              <n-alert v-if="resumesError" type="error" :show-icon="false" class="resume-board__alert">
                {{ resumesError }}
              </n-alert>
              <div v-if="resumesLoading" class="resume-board__loading">正在加载简历列表...</div>
              <article
                v-for="resume in myResumeList"
                :key="resume.id"
                class="resume-list-card"
              >
                <div class="resume-list-card__main" @click="openResume(resume.id)">
                  <div class="resume-list-card__img">
                    <img :src="resume.previewImageUrl" alt="简历封面" />
                  </div>
                  <div class="resume-list-card__content">
                    <strong>{{ resume.title }}</strong>

                    <div class="resume-list-card__content_footer">
                      <small>
                        上次更新：
                        <NuxtTime
                          :datetime="new Date(resume.updateTime)"
                          year="numeric"
                          month="long"
                          day="numeric"
                          hour="2-digit"
                          minute="2-digit"
                          />
                      </small>
                    </div>
                  </div>
                </div>
                <div class="footer-actions" @click.stop>
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <button type="button" class="footer-action-btn" @click.stop="handleRename(resume.id)">
                            <n-icon size="20">
                              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M15 16l-4 4h10v-4zm-2.94-8.81L3 16.25V20h3.75l9.06-9.06l-3.75-3.75zM5.92 18H5v-.92l7.06-7.06l.92.92L5.92 18zm12.79-9.96a.996.996 0 0 0 0-1.41l-2.34-2.34a1.001 1.001 0 0 0-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z" fill="currentColor"></path></svg>
                            </n-icon>
                          </button>
                        </template>
                        修改简历名字
                      </n-tooltip>
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <button type="button" class="footer-action-btn" @click="deleteResume(resume.id)">
                            <n-icon size="20">
                              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M12 12h2v12h-2z" fill="currentColor"></path><path d="M18 12h2v12h-2z" fill="currentColor"></path><path d="M4 6v2h2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8h2V6zm4 22V8h16v20z" fill="currentColor"></path><path d="M12 2h8v2h-8z" fill="currentColor"></path></svg>
                            </n-icon>
                          </button>
                        </template>
                        删除该简历
                      </n-tooltip>
                </div>
              </article>
              <div v-if="!resumesLoading && !myResumeList.length && !resumesError" class="resume-board__empty">
                你还没有创建任何简历
              </div>
              <n-pagination
                v-if="resumeTotal > resumePageSize"
                class="resume-board__pagination"
                :page="resumePage"
                :page-size="resumePageSize"
                :item-count="resumeTotal"
                @update:page="handleResumePageChange"
              />
            </aside>

            <div class="resume-board__gallery">
              <div class="resume-gallery-grid">
                <ResumeCardNew
                  v-for="template in recommendTemplates"
                  :key="template.id"
                  :title="template.title"
                  :imgUrl="template.previewImageUrl"
                  :tags="template.tags"
                  />
              </div>
            </div>

            <n-modal v-model:show="showRenameModal" :closable="false">
              <n-card
                style="width: 600px"
                title="模态框"
                :bordered="false"
                size="huge"
                role="dialog"
                aria-modal="true"
              >

                <n-form
                  :model="renameForm"
                  label-placement="top"
                  :label-width="80"
                >
                  <n-form-item label="简历名字" path="newTitle">
                    <n-input v-model:value="renameForm.newTitle" placeholder="输入简历名字" />
                  </n-form-item>
                </n-form>
                <template #footer>
                  <n-button @click="showRenameModal = false">取消</n-button>
                  <n-button type="primary" @click="handleRenameConfirm">确认</n-button>
                </template>
              </n-card>
            </n-modal>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.personal-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #eef2ff 100%);
}

.personal-shell {
  width: min(1380px, 100%);
  margin: 28px auto 0;
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 22px;
}

.personal-sidebar,
.personal-panel {
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
  border-radius: 28px;
}

.personal-sidebar {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.95);

  strong {
    font-size: 24px;
    color: #111827;
  }

  span {
    color: #64748b;
    font-size: 13px;
  }
}

.profile-card__avatar {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  overflow: hidden;
  background: linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.profile-menu {
  display: grid;
  gap: 10px;
}

.profile-menu__item {
  padding: 14px 16px;
  border-radius: 18px;
  text-align: left;
  color: #334155;
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.9);

  &.is-active {
    color: #2563eb;
    background: rgba(37, 99, 235, 0.08);
    border-color: rgba(37, 99, 235, 0.18);
  }
}

.personal-main {
  min-width: 0;
}

.personal-panel {
  padding: 24px;
}

.personal-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.85) 0%, rgba(255, 255, 255, 0.92) 45%, rgba(224, 231, 255, 0.9) 100%);
  margin-bottom: 22px;

  span {
    color: #475569;
    font-size: 13px;
  }

  h1 {
    margin: 8px 0;
    font-size: 30px;
    color: #111827;
  }

  p {
    margin: 0;
    color: #64748b;
  }
}

.profile-form-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 24px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-id-row {
  display: flex;
  gap: 8px;
  color: #334155;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    font-size: 13px;
    color: #475569;
  }
}

.profile-form__actions {
  display: flex;
  gap: 12px;
}

.profile-avatar-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-avatar-panel__upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #fff;
  color: #334155;
  cursor: pointer;

  input {
    display: none;
  }
}

.profile-avatar-panel__preview {
  height: 220px;
  border-radius: 20px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px dashed rgba(148, 163, 184, 0.28);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.resume-board__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  span {
    color: #2563eb;
    font-size: 13px;
  }

  h1 {
    margin: 8px 0 0;
    font-size: 30px;
    color: #111827;
  }
}

.resume-board__more {
  color: #2563eb;
  font-size: 13px;
}

.resume-board {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 20px;
}

.resume-board__list {
  display: grid;
  gap: 16px;
  padding-right: 8px;
  align-content: start;
}

.resume-list-card {
  padding: 14px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.resume-list-card__main {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 14px;
  cursor: pointer;
}

.resume-list-card__thumb,
.resume-gallery-card__preview {
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.resume-list-card__thumb {
  height: 136px;
}

.resume-list-card__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  justify-content: space-between;

  strong {
    color: #111827;
    font-size: 18px;
    line-height: 1.4;
  }

  small {
    color: #64748b;
  }
}

.resume-list-card__content_footer{
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
}

.footer-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 10px;
  background: rgba(248, 250, 252, 0.95);
  color: #475569;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(37, 99, 235, 0.08);
    color: #2563eb;
  }
}

.resume-board__pagination {
  margin-top: 8px;
  justify-self: start;
}

.resume-list-card__tags,
.resume-gallery-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.08);
    color: #2563eb;
    font-size: 12px;
  }
}

.resume-board__gallery {
  min-width: 0;
}

.resume-gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.resume-gallery-card {
  padding: 16px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.9);

  strong {
    display: block;
    margin: 12px 0 10px;
    color: #111827;
    line-height: 1.5;
  }
}

.resume-gallery-card__preview {
  height: 280px;
}

@media (max-width: 1180px) {
  .personal-shell,
  .resume-board,
  .profile-form-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .personal-page {
    padding: 0 18px 18px;
  }

  .personal-shell {
    gap: 18px;
  }

  .resume-gallery-grid {
    grid-template-columns: 1fr;
  }

  .personal-banner,
  .resume-board__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
