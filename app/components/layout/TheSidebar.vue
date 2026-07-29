<template>
  <div>
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
      @click="isOpen = false"
    ></div>

    <aside
      class="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-40 transition-transform duration-300 lg:translate-x-0"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-10">
          <div class="flex items-center gap-3">
            <div class="bg-blue-600 p-2 rounded-lg text-white">
              <GraduationCap :size="24" />
            </div>
            <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">LMS</span>
          </div>
          <button class="lg:hidden text-slate-400 hover:text-slate-600 transition-all" @click="isOpen = false">
            <X :size="22" />
          </button>
        </div>

        <nav class="space-y-1">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.rawPath"
            :to="localePath(item.rawPath)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
            :class="[
              isActive(item.rawPath, item.exact)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
            ]"
            @click="isOpen = false"
          >
            <component :is="item.icon" :size="20" class="transition-transform group-hover:scale-110" />
            <span class="font-medium flex-1">{{ isAdmin ? item.labelKey : $t(item.labelKey) }}</span>
            <span
              v-if="item.rawPath === '/messages' && unreadCount > 0"
              class="size-5 flex items-center justify-center rounded-full text-[10px] font-bold"
              :class="isActive(item.rawPath) ? 'bg-white text-blue-600' : 'bg-red-500 text-white'"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </NuxtLink>
        </nav>
      </div>

      <div class="mt-auto p-6 space-y-4">
        <button class="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all" @click="handleLogout">
          <LogOut :size="20" />
          <span class="font-medium">{{ $t('nav.logout') }}</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import {
  GraduationCap,
  LayoutDashboard,
  Compass,
  BookOpen,
  Calendar,
  Award,
  Settings,
  LogOut,
  Video,
  MessageSquare,
  X,
  Shield,
  Users,
  Tag,
  NotebookPen,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const localePath = useLocalePath()
const token = useCookie('token')
const unreadCount = useUnreadMessages()
const isOpen = useMobileSidebar()

const isInstructor = computed(() =>
  authStore.user?.role === 'FORMATEUR' || authStore.user?.role === 'ADMINISTRATEUR'
)

const isAdmin = computed(() => authStore.user?.role === 'ADMINISTRATEUR')

const menuItems = computed(() => {
  if (isAdmin.value) {
    return [
      { labelKey: 'Dashboard', rawPath: '/admin', icon: LayoutDashboard, exact: true },
      { labelKey: 'Utilisateurs', rawPath: '/admin/users', icon: Users },
      { labelKey: 'Cours', rawPath: '/admin/courses', icon: BookOpen },
      { labelKey: 'Catégories', rawPath: '/admin/categories', icon: Tag },
    ]
  }

  const items = [
    { labelKey: 'nav.dashboard', rawPath: '/', icon: LayoutDashboard },
    { labelKey: 'nav.catalog', rawPath: '/catalog', icon: Compass },
    { labelKey: 'nav.courses', rawPath: '/courses', icon: BookOpen },
    { labelKey: 'nav.notes', rawPath: '/notes', icon: NotebookPen },
    { labelKey: 'nav.conferences', rawPath: '/conferences', icon: Video },
    { labelKey: 'nav.messages', rawPath: '/messages', icon: MessageSquare },
    { labelKey: 'nav.schedule', rawPath: '/schedule', icon: Calendar },
    { labelKey: 'nav.certificates', rawPath: '/certificates', icon: Award },
    { labelKey: 'nav.settings', rawPath: '/settings', icon: Settings },
  ]
  if (isInstructor.value) {
    items.splice(4, 0, { labelKey: 'nav.my_conferences', rawPath: '/instructor/conferences', icon: Video })
  }
  return items
})

const isActive = (rawPath, exact = false) => {
  const localizedPath = localePath(rawPath)
  const homePath = localePath('/')
  if (localizedPath === homePath || exact) return route.path === localizedPath
  return route.path.startsWith(localizedPath)
}

const handleLogout = async () => {
  await authStore.logout()
  navigateTo(localePath('/auth/login'))
}

onMounted(async () => {
  if (!token.value) return
  try {
    const { count } = await $fetch('/api/messages/unread', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    unreadCount.value = count
  } catch {}
})
</script>
