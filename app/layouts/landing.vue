<template>
  <div class="min-h-screen" style="background-color:#faf8ff;">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2">
          <div class="bg-blue-600 p-1.5 rounded-lg text-white">
            <GraduationCap :size="20" />
          </div>
          <span class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">EduPulse</span>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink :to="localePath('/catalog')" class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Catalogue</NuxtLink>
          <NuxtLink :to="localePath('/conferences')" class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Conférences</NuxtLink>
        </nav>

        <div class="hidden md:flex items-center gap-3">
          <NuxtLink :to="localePath('/auth/login')" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Se connecter
          </NuxtLink>
          <NuxtLink :to="localePath('/auth/register')" class="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            S'inscrire
          </NuxtLink>
        </div>

        <button class="md:hidden p-2 text-slate-600" @click="mobileMenuOpen = !mobileMenuOpen">
          <Menu :size="24" />
        </button>
      </div>

      <div v-if="mobileMenuOpen" class="md:hidden border-t border-slate-200 bg-white">
        <nav class="px-4 py-4 space-y-2">
          <NuxtLink :to="localePath('/catalog')" class="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" @click="mobileMenuOpen = false">Catalogue</NuxtLink>
          <NuxtLink :to="localePath('/conferences')" class="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" @click="mobileMenuOpen = false">Conférences</NuxtLink>
          <div class="border-t border-slate-200 my-2"></div>
          <NuxtLink :to="localePath('/auth/login')" class="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" @click="mobileMenuOpen = false">Se connecter</NuxtLink>
          <NuxtLink :to="localePath('/auth/register')" class="block px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-center" @click="mobileMenuOpen = false">S'inscrire</NuxtLink>
        </nav>
      </div>
    </header>
    <slot />
  </div>
</template>

<script setup>
import { GraduationCap, Menu } from 'lucide-vue-next'
const localePath = useLocalePath()
const mobileMenuOpen = ref(false)
</script>
