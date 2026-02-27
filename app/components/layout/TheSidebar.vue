<template>
  <aside class="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full transition-all">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-10">
        <div class="bg-blue-600 p-2 rounded-lg text-white">
          <GraduationCap :size="24" />
        </div>
        <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">LMS</span>
      </div>

      <nav class="space-y-1">
        <NuxtLink 
          v-for="item in menuItems" 
          :key="item.rawPath"
          :to="localePath(item.rawPath)"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
          :class="[
            isActive(item.rawPath) 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
          ]"
        >
          <component :is="item.icon" :size="20" class="transition-transform group-hover:scale-110" />
          <!-- $t() in template is always reactive on locale change -->
          <span class="font-medium">{{ $t(item.labelKey) }}</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="mt-auto p-6 space-y-4">
      <button class="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all" @click="handleLogout">
        <LogOut :size="20" />
        <span class="font-medium">{{ $t('nav.logout') }}</span>
      </button>
      
      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div class="flex justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>{{ $t('nav.storage') }}</span>
          <span>75%</span>
        </div>
        <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full bg-blue-600 rounded-full" style="width: 75%"></div>
        </div>
        <p class="text-[10px] text-slate-400 mt-2 text-center">{{ $t('nav.storage_limit', { used: 15, total: 20 }) }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Award, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const route = useRoute();
const localePath = useLocalePath();

// Store only static data — the label is resolved via $t(item.labelKey) in the template
// localePath() is called directly in the template :to binding so it's always reactive
const menuItems = [
  { labelKey: 'nav.dashboard', rawPath: '/', icon: LayoutDashboard },
  { labelKey: 'nav.courses', rawPath: '/courses', icon: BookOpen },
  { labelKey: 'nav.schedule', rawPath: '/schedule', icon: Calendar },
  { labelKey: 'nav.certificates', rawPath: '/certificates', icon: Award },
  { labelKey: 'nav.community', rawPath: '/community', icon: Users },
  { labelKey: 'nav.settings', rawPath: '/settings', icon: Settings },
];

// Compares route.path against the localized path (includes locale prefix like /en/).
// Using rawPath here so localePath() is called at runtime with the current locale.
const isActive = (rawPath) => {
  const localizedPath = localePath(rawPath);
  const homePath = localePath('/');
  if (localizedPath === homePath) return route.path === homePath;
  return route.path.startsWith(localizedPath);
};

const handleLogout = () => {
  authStore.logout();
  navigateTo(localePath('/auth/login'));
};
</script>
