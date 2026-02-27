<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div v-for="stat in stats" :key="stat.labelKey" 
      class="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div class="flex items-start justify-between mb-4">
        <div :class="['p-3 rounded-2xl transition-transform group-hover:scale-110 text-white shadow-sm', stat.bg, stat.color]">
          <component :is="stat.icon" :size="24" />
        </div>
        <span :class="`text-xs font-bold px-2 py-1 rounded-lg ${stat.up ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`">
          {{ $t(stat.trendKey) }}
        </span>
      </div>
      <div>
        <p class="text-slate-500 text-sm font-medium mb-1">{{ $t(stat.labelKey) }}</p>
        <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
      </div>
      <div class="absolute -bottom-2 -right-2 opacity-5">
         <component :is="stat.icon" :size="80" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookOpen, CheckCircle, Clock } from 'lucide-vue-next';

// Store only static keys — $t() in the template is always reactive to locale changes
const stats = [
  { labelKey: 'dashboard.stats.enrolled_courses', trendKey: 'dashboard.stats.trend_week', value: '4', up: false, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { labelKey: 'dashboard.stats.lessons_completed', trendKey: 'dashboard.stats.trend_today', value: '28', up: true, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { labelKey: 'dashboard.stats.learning_hours', trendKey: 'dashboard.stats.last_7_days', value: '12.5 h', up: false, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
];
</script>
