<template>
  <header class="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10 transition-all">
    <div class="flex items-center gap-4 flex-1">
      <button class="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all shrink-0" @click="isSidebarOpen = true">
        <Menu :size="22" />
      </button>
      <div class="relative max-w-md w-full hidden sm:block">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('nav.search_placeholder')"
          class="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base"
          @keyup.enter="submitSearch"
        >
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-4">
      <div class="hidden sm:flex bg-slate-50 p-1 rounded-xl border border-slate-100 mr-2">
        <button
          v-for="locale in availableLocales"
          :key="locale.code"
          type="button"
          class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase"
          :class="currentLocale === locale.code ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
          @click="setLocale(locale.code)"
        >
          {{ locale.code }}
        </button>
      </div>

      <button type="button" class="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative">
        <Bell :size="20" />
        <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
      </button>

      <div class="h-8 w-[1px] bg-slate-200 mx-1 sm:mx-2 hidden sm:block" />

      <div ref="menuRoot" class="relative">
        <button
          type="button"
          class="flex items-center gap-3 pl-2 rounded-xl hover:bg-slate-50 transition-colors py-1.5 pr-2"
          @click="menuOpen = !menuOpen"
        >
          <div class="text-right hidden sm:block">
            <p class="text-base font-bold text-slate-900 leading-none mb-1">
              {{ displayName }}
            </p>
            <p class="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {{ roleLabel }}
            </p>
          </div>
          <img
            :src="avatarUrl"
            class="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover bg-slate-100"
            alt="Avatar"
          >
          <ChevronDown :size="16" class="text-slate-400 hidden sm:block" />
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 py-2 z-50"
        >
          <div class="px-4 py-2 border-b border-slate-100">
            <p class="text-sm font-bold text-slate-800 truncate">{{ displayName }}</p>
            <p class="text-xs text-slate-400 truncate">{{ user?.email }}</p>
          </div>
          <NuxtLink
            :to="{ path: localePath('/settings'), query: { tab: 'profile' } }"
            class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            @click="menuOpen = false"
          >
            <User :size="16" />
            {{ $t('topbar.my_profile') }}
          </NuxtLink>
          <NuxtLink
            :to="{ path: localePath('/settings'), query: { tab: 'password' } }"
            class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            @click="menuOpen = false"
          >
            <Lock :size="16" />
            {{ $t('topbar.password') }}
          </NuxtLink>
          <NuxtLink
            :to="{ path: localePath('/settings'), query: { tab: 'security' } }"
            class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            @click="menuOpen = false"
          >
            <Shield :size="16" />
            {{ $t('topbar.security') }}
          </NuxtLink>
          <div class="my-1 border-t border-slate-100" />
          <button
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
            @click="handleLogout"
          >
            <LogOut :size="16" />
            {{ $t('topbar.logout') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Search, Bell, Menu, ChevronDown, User, Lock, Shield, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const isSidebarOpen = useMobileSidebar()

const { t, locale: currentLocale, locales: availableLocales, setLocale } = useI18n()

const localePath = useLocalePath()
const router = useRouter()
const searchQuery = ref('')
const menuOpen = ref(false)
const menuRoot = ref(null)

const displayName = computed(() => {
  if (!user.value) return t('topbar.student_fallback')
  const name = [user.value.firstName, user.value.lastName].filter(Boolean).join(' ')
  return name || user.value.email || t('topbar.student_fallback')
})

const roleLabel = computed(() => {
  const role = user.value?.role
  if (role === 'ADMINISTRATEUR') return t('roles.admin')
  if (role === 'FORMATEUR') return t('roles.instructor')
  return t('roles.learner')
})

const avatarUrl = computed(() => {
  if (user.value?.avatar) return String(user.value.avatar)
  const seed = user.value?.firstName || user.value?.email || 'Alex'
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
})

function submitSearch() {
  const query = searchQuery.value.trim()
  if (!query) return
  router.push({ path: localePath('/catalog'), query: { search: query } })
}

async function handleLogout() {
  menuOpen.value = false
  await authStore.logout()
  navigateTo(localePath('/auth/login'))
}

function onDocClick(e) {
  if (!menuRoot.value) return
  if (!menuRoot.value.contains(e.target)) menuOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
