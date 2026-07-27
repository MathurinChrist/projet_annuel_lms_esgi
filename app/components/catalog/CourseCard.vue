<template>
  <NuxtLink
    :to="localePath(`/courses/${course.slug}`)"
    class="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col"
  >
    <div class="relative h-40 overflow-hidden" :class="course.coverImage ? '' : coverGradient">
      <img
        v-if="course.coverImage"
        :src="course.coverImage"
        :alt="course.title"
        class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <BookOpen v-else :size="32" class="absolute inset-0 m-auto text-white/80" />
      <span
        v-if="course.category"
        class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-primary"
      >
        {{ course.category.name }}
      </span>
      <span class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-slate-600">
        {{ difficultyLabel }}
      </span>
    </div>

    <div class="p-5 flex-1 flex flex-col">
      <div class="flex items-center gap-2 mb-2.5">
        <template v-if="course.reviewCount">
          <div class="flex items-center text-amber-400">
            <Star :size="14" class="fill-amber-400" />
          </div>
          <span class="text-sm font-bold text-slate-900">{{ course.rating.toFixed(1) }}</span>
          <span class="text-xs text-slate-400">{{ $t('catalog.reviews_count', { count: course.reviewCount }) }}</span>
        </template>
        <span v-else class="text-xs text-slate-400">{{ $t('catalog.no_reviews') }}</span>
      </div>

      <h3 class="font-bold text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">{{ course.title }}</h3>
      <p v-if="authorName" class="text-sm text-slate-400 mb-4">{{ authorName }}</p>

      <div class="mt-auto">
        <div v-if="course.enrolled" class="space-y-2 pt-2">
          <div class="flex justify-between text-[11px] font-bold">
            <span class="text-primary">{{ $t('catalog.in_progress') }}</span>
            <span class="text-slate-400">{{ course.progress }}%</span>
          </div>
          <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full" :style="{ width: `${course.progress}%` }" />
          </div>
        </div>
        <div v-else class="flex items-center justify-between pt-2 border-t border-slate-100">
          <div class="flex items-center gap-1 text-slate-400">
            <Clock :size="14" />
            <span class="text-xs">{{ durationLabel }}</span>
          </div>
          <span class="text-sm font-bold text-primary">{{ $t('catalog.start_course') }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { BookOpen, Star, Clock } from 'lucide-vue-next'
import { formatDuration } from '~/utils/duration'

const props = defineProps({
  course: { type: Object, required: true },
})

const localePath = useLocalePath()
const { t } = useI18n()

const DIFFICULTY_KEYS = {
  BEGINNER: 'catalog.difficulty_beginner',
  INTERMEDIATE: 'catalog.difficulty_intermediate',
  ADVANCED: 'catalog.difficulty_advanced',
}

const GRADIENTS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-violet-500 to-purple-700',
  'bg-gradient-to-br from-sky-400 to-blue-600',
  'bg-gradient-to-br from-emerald-400 to-teal-600',
  'bg-gradient-to-br from-orange-400 to-rose-500',
  'bg-gradient-to-br from-pink-400 to-fuchsia-600',
]

const difficultyLabel = computed(() => {
  const key = DIFFICULTY_KEYS[props.course.difficulty?.toUpperCase()]
  return key ? t(key) : props.course.difficulty
})
const coverGradient = computed(() => GRADIENTS[props.course.id % GRADIENTS.length])
const authorName = computed(() => {
  const a = props.course.author
  if (!a) return ''
  return [a.firstName, a.lastName].filter(Boolean).join(' ')
})
const durationLabel = computed(() => formatDuration(props.course.durationMinutes))
</script>
