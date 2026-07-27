<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold text-slate-900">{{ $t('dashboard.active_courses') }}</h3>
      <NuxtLink to="/courses" class="text-blue-600 font-bold text-base hover:underline">{{ $t('dashboard.see_all') }}</NuxtLink>
    </div>
    <div v-if="!enrollments?.length" class="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm text-center">
      <p class="text-sm text-slate-400">Aucun cours en cours pour le moment.</p>
    </div>
    <div v-else class="space-y-4">
      <NuxtLink
        v-for="enrollment in enrollments"
        :key="enrollment.course.slug"
        :to="`/learn/${enrollment.course.slug}`"
        class="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-blue-200 transition-all"
      >
        <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-white shrink-0 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
          <img v-if="enrollment.course.coverImage" :src="enrollment.course.coverImage" class="w-full h-full object-cover" />
          <BookOpen v-else :size="28" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
              {{ enrollment.course.category?.name ?? $t('common.general') }}
            </span>
            <span class="text-xs text-slate-500 font-bold">• {{ $t('dashboard.lessons_count', { count: enrollment.course.lessonCount }) }}</span>
          </div>
          <h4 class="font-bold text-base text-slate-900 truncate mb-3">{{ enrollment.course.title }}</h4>
          <div class="flex items-center gap-3">
            <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
               <div class="h-full bg-blue-600 rounded-full" :style="{ width: `${enrollment.progress}%` }"></div>
            </div>
            <span class="text-xs font-bold text-slate-600">{{ enrollment.progress }}%</span>
          </div>
        </div>
        <span class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <Play :size="18" fill="currentColor" />
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { Play, BookOpen } from 'lucide-vue-next';

const student = useStudentCourse();
const enrollments = ref([]);

onMounted(async () => {
  try {
    enrollments.value = await student.getEnrollments();
  } catch {
    enrollments.value = [];
  }
});
</script>
