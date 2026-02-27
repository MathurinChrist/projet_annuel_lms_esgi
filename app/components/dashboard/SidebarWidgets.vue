<template>
  <div class="space-y-8">
    <!-- Live Now Card -->
    <div class="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
      <div class="absolute top-4 right-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
         {{ $t('dashboard.live_now') }}
      </div>
      <div class="relative z-10">
        <p class="text-blue-100 text-xs font-bold uppercase tracking-widest mb-4">{{ $t('dashboard.at_the_moment') }}</p>
        <h3 class="text-xl font-bold mb-6 leading-tight">Q&A : Architecture Backend avec Nuxt 4</h3>
        <div class="flex items-center gap-3 mb-8">
          <div class="flex -space-x-3">
            <img v-for="i in 3" :key="i" :src="`https://i.pravatar.cc/100?u=${i}`" class="w-8 h-8 rounded-full border-2 border-blue-600 shadow-sm" />
          </div>
          <p class="text-xs text-blue-100 font-medium">{{ $t('dashboard.participants', { count: 152 }) }}</p>
        </div>
        <button class="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-lg">
          <Video :size="18" />
          {{ $t('dashboard.join_session') }}
        </button>
      </div>
      <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
    </div>

    <!-- Upcoming Sessions -->
    <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-8">
         <h3 class="text-lg font-bold text-slate-900">{{ $t('dashboard.upcoming_sessions') }}</h3>
         <button class="text-slate-400 hover:text-slate-600 transition-all">
           <MoreHorizontal :size="20" />
         </button>
      </div>
      <div class="space-y-6">
        <div v-for="session in sessions" :key="session.title" class="flex items-center gap-4 group cursor-pointer">
          <div class="w-14 h-14 bg-slate-50 flex flex-col items-center justify-center rounded-2xl border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ session.month }}</span>
            <span class="text-lg font-bold text-slate-900 leading-none group-hover:text-blue-600">{{ session.day }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-sm text-slate-900 truncate mb-1">{{ session.title }}</h4>
            <p class="text-xs text-slate-500 font-medium">{{ session.time }}</p>
          </div>
          <button class="text-slate-300 hover:text-blue-600">
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
       <h3 class="text-lg font-bold mb-6">{{ $t('dashboard.recent_activity') }}</h3>
       <div class="space-y-6">
         <div v-for="activity in recentActivity" :key="activity.id" class="flex gap-4">
            <div :class="['w-2 h-2 rounded-full mt-2 shrink-0', activity.color]"></div>
            <div>
               <!-- Use $t() directly in template — stays reactive on locale change -->
               <p class="text-sm font-medium text-slate-100 leading-snug mb-1">{{ $t(activity.textKey) }}</p>
               <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                 {{ activity.timeKey === 'yesterday'
                    ? $t('dashboard.yesterday')
                    : $t('dashboard.time_hours', { count: activity.timeCount })
                 }}
               </p>
            </div>
         </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { Video, MoreHorizontal, ChevronRight } from 'lucide-vue-next';

const sessions = [
  { title: 'Sécurité en Entreprise 101', month: 'OCT', day: '14', time: '10:00 AM - 11:30 AM' },
  { title: 'Gestion de Projet Agile', month: 'OCT', day: '16', time: '02:00 PM - 03:30 PM' },
];

// Store only static data — translations are resolved in the template via $t() which is always reactive
const recentActivity = [
  { id: 1, textKey: 'dashboard.activity_item_1', timeKey: 'hours', timeCount: 2, color: 'bg-blue-500' },
  { id: 2, textKey: 'dashboard.activity_item_2', timeKey: 'hours', timeCount: 5, color: 'bg-purple-500' },
  { id: 3, textKey: 'dashboard.activity_item_3', timeKey: 'yesterday', timeCount: null, color: 'bg-green-500' },
];
</script>
