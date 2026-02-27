<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold text-slate-900">{{ $t('dashboard.active_courses') }}</h3>
      <NuxtLink to="/courses" class="text-blue-600 font-bold text-sm hover:underline">{{ $t('dashboard.see_all') }}</NuxtLink>
    </div>
    <div class="space-y-4">
      <div v-for="course in courses" :key="course.title" 
        class="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-blue-200 transition-all">
        <div :class="['w-20 h-20 rounded-2xl flex items-center justify-center text-white shrink-0 overflow-hidden', course.bg]">
          <img :src="course.image" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full', course.tagBg, course.tagColor]">
              {{ course.category }}
            </span>
            <span class="text-[10px] text-slate-400 font-bold">• {{ $t('dashboard.lessons_count', { count: course.lessons }) }}</span>
          </div>
          <h4 class="font-bold text-slate-900 truncate mb-3">{{ course.title }}</h4>
          <div class="flex items-center gap-3">
            <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-blue-600 rounded-full" :style="{ width: `${course.progress}%` }"></div>
            </div>
            <span class="text-[11px] font-bold text-slate-500">{{ course.progress }}%</span>
          </div>
        </div>
        <button class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <Play :size="18" fill="currentColor" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Play } from 'lucide-vue-next';

const courses = [
  { 
    title: 'The Modern JavaScript Bootcamp 2024', 
    category: 'Web Design', 
    progress: 85, 
    lessons: 42, 
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=200',
    bg: 'bg-blue-100',
    tagBg: 'bg-blue-50',
    tagColor: 'text-blue-600'
  },
  { 
    title: 'Advanced UI/UX Principles & Prototyping', 
    category: 'Design', 
    progress: 45, 
    lessons: 28, 
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?auto=format&fit=crop&q=80&w=200',
    bg: 'bg-purple-100',
    tagBg: 'bg-purple-50',
    tagColor: 'text-purple-600'
  },
];
</script>
