<template>
  <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
    <div class="flex items-center gap-4 flex-1">
      <div class="relative max-w-md w-full">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
        <input 
          type="text" 
          :placeholder="$t('nav.search_placeholder')"
          class="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
      </div>
    </div>

    <div class="flex items-center gap-4">
      <!-- Language Switcher -->
      <div class="flex bg-slate-50 p-1 rounded-xl border border-slate-100 mr-2">
        <button 
          v-for="locale in availableLocales" 
          :key="locale.code"
          @click="setLocale(locale.code)"
          class="px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase"
          :class="currentLocale === locale.code ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
        >
          {{ locale.code }}
        </button>
      </div>

      <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative">
        <Bell :size="20" />
        <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      
      <div class="h-8 w-[1px] bg-slate-200 mx-2"></div>

      <div class="flex items-center gap-3 pl-2">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-bold text-slate-900 leading-none mb-1">{{ user?.name || 'Étudiant' }}</p>
          <p class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{{ $t('nav.premium_plan') }}</p>
        </div>
        <img 
          :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Alex'}`" 
          class="w-10 h-10 rounded-xl border-2 border-white shadow-sm"
          alt="Avatar"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
import { Search, Bell } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const { locale: currentLocale, locales: availableLocales, setLocale } = useI18n();
</script>
