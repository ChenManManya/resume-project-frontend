<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { logout } from '~/apis/authApi'
import { useAuthState } from '~/composables/useAuthState'
import { useCurrentUser } from '~/composables/useCurrentUser'

const route = useRoute()
const authState = useAuthState()
const currentUserState = useCurrentUser()

const navLinks = [
  { label: '首页', to: '/' },
  { label: '简历制作', to: '/maker' },
  { label: '个人中心', to: '/personal' }
]

const userMenuOpen = ref(false)

const displayName = computed(() => currentUserState.currentUser.value?.nickname || currentUserState.currentUser.value?.username || '我的账户')
const showUserMenu = computed(() => authState.isAuthed.value && Boolean(currentUserState.currentUser.value))

watch(
  () => authState.isAuthed.value,
  (value) => {
    if (value) {
      void currentUserState.load()
      return
    }

    currentUserState.clear()
  },
  { immediate: true }
)

const closeUserMenu = () => {
  userMenuOpen.value = false
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const handleDocumentClick = () => {
  closeUserMenu()
}

if (import.meta.client) {
  document.addEventListener('click', handleDocumentClick)
}

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('click', handleDocumentClick)
  }
})

const goPersonal = async () => {
  closeUserMenu()
  await navigateTo('/personal')
}

const handleLogout = async () => {
  try {
    await logout()
  } catch {
    authState.clear()
  }

  authState.clear()
  currentUserState.clear()

  await navigateTo('/login')
}
</script>

<template>
  <header class="app-top-nav">
    <div class="app-top-nav__inner">
      <NuxtLink class="app-top-nav__brand" to="/">慢慢简历</NuxtLink>

      <nav class="app-top-nav__links">
        <NuxtLink
          v-for="item in navLinks"
          :key="item.to"
          :to="item.to"
          class="app-top-nav__link"
          :class="{ 'is-active': route.path === item.to }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="app-top-nav__actions">
        <template v-if="showUserMenu">
          <div class="app-top-nav__user-wrap" @click.stop>
            <button class="app-top-nav__user" type="button" @click="toggleUserMenu">
              <n-avatar round size="small" :src="currentUserState.currentUser.value?.avatar || undefined">
                {{ displayName.slice(0, 1) }}
              </n-avatar>
              <span>{{ displayName }}</span>
            </button>

            <div v-if="userMenuOpen" class="app-top-nav__menu">
              <button type="button" @click="goPersonal">个人中心</button>
              <button type="button" @click="handleLogout">退出</button>
            </div>
          </div>
        </template>
        <template v-else>
          <NuxtLink class="app-top-nav__ghost" to="/login">登录</NuxtLink>
          <NuxtLink class="app-top-nav__primary" to="/register">注册</NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-top-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(14px);
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.app-top-nav__inner {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.app-top-nav__brand {
  color: #111827;
  font-weight: 700;
  font-size: 18px;
}

.app-top-nav__links,
.app-top-nav__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-top-nav__link {
  padding: 8px 12px;
  border-radius: 999px;
  color: #475569;
  font-size: 14px;

  &.is-active {
    background: rgba(37, 99, 235, 0.08);
    color: #2563eb;
  }
}

.app-top-nav__ghost,
.app-top-nav__primary,
.app-top-nav__user {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 14px;
}

.app-top-nav__ghost {
  color: #334155;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.app-top-nav__primary {
  color: #fff;
  background: #2563eb;
}

.app-top-nav__user {
  gap: 10px;
  color: #111827;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.app-top-nav__user-wrap {
  position: relative;
}

.app-top-nav__menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 150px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(16px);

  button {
    width: 100%;
    padding: 10px 12px;
    border-radius: 12px;
    color: #334155;
    text-align: left;

    &:hover {
      background: rgba(37, 99, 235, 0.08);
      color: #2563eb;
    }
  }
}

@media (max-width: 760px) {
  .app-top-nav__inner {
    width: min(100%, calc(100% - 24px));
    min-height: 64px;
  }

  .app-top-nav__links {
    display: none;
  }
}
</style>
