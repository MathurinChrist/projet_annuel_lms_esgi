<template>
  <div class="min-h-screen bg-[#F8FAFC]">
    <!-- Layout authentifié : sidebar + topbar -->
    <template v-if="isAuthenticated">
      <div class="flex">
        <LayoutTheSidebar />
        <main class="flex-1 lg:ml-64 transition-all">
          <LayoutTheTopBar />
          <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <slot />
          </div>
        </main>
      </div>
    </template>

    <!-- Layout public : header simple -->
    <template v-else>
      <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <NuxtLink :to="localePath('/')" class="flex items-center gap-2">
            <div class="bg-blue-600 p-1.5 rounded-lg text-white">
              <GraduationCap :size="20" />
            </div>
            <span class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">EduPulse</span>
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink :to="localePath('/catalog')" class="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Catalogue</NuxtLink>
            <NuxtLink :to="localePath('/conferences')" class="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Conférences</NuxtLink>
          </nav>

          <div class="hidden md:flex items-center gap-3">
            <NuxtLink :to="localePath('/auth/login')" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Se connecter
            </NuxtLink>
            <NuxtLink :to="localePath('/auth/register')" class="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              S'inscrire
            </NuxtLink>
          </div>

          <button class="md:hidden p-2 text-slate-600" @click="publicMenuOpen = !publicMenuOpen">
            <Menu :size="24" />
          </button>
        </div>

        <!-- Mobile menu -->
        <div v-if="publicMenuOpen" class="md:hidden border-t border-slate-200 bg-white">
          <nav class="px-4 py-4 space-y-2">
            <NuxtLink :to="localePath('/catalog')" class="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" @click="publicMenuOpen = false">Catalogue</NuxtLink>
            <NuxtLink :to="localePath('/conferences')" class="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" @click="publicMenuOpen = false">Conférences</NuxtLink>
            <div class="border-t border-slate-200 my-2"></div>
            <NuxtLink :to="localePath('/auth/login')" class="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" @click="publicMenuOpen = false">Se connecter</NuxtLink>
            <NuxtLink :to="localePath('/auth/register')" class="block px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-center" @click="publicMenuOpen = false">S'inscrire</NuxtLink>
          </nav>
        </div>
      </header>
      <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <slot />
      </main>
    </template>
  </div>
</template>

<script setup>
import { GraduationCap, Menu } from 'lucide-vue-next'

const authStore = useAuthStore()
const localePath = useLocalePath()
const isAuthenticated = computed(() => !!authStore.user)
const publicMenuOpen = ref(false)
</script>

