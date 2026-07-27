<template>
  <div
    class="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col"
  >
    <div class="relative h-44 overflow-hidden" :class="course.coverImage ? '' : coverGradient">
      <img
        v-if="course.coverImage"
        :src="course.coverImage"
        :alt="course.title"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div class="absolute top-4 left-4">
        <span class="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-widest shadow-sm">
          {{ categoryLabel }}
        </span>
      </div>

      <div class="absolute top-4 right-4">
        <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm" :class="statusBadge">
          {{ statusLabel }}
        </span>
      </div>

      <div class="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
        <div class="flex items-center gap-3 text-xs font-medium">
          <span class="flex items-center gap-1">
            <LayoutList :size="12" />
            {{ course.modules.length }} module{{ course.modules.length !== 1 ? 's' : '' }}
          </span>
          <span class="flex items-center gap-1">
            <BookOpen :size="12" />
            {{ lessonCount }} leçon{{ lessonCount !== 1 ? 's' : '' }}
          </span>
        </div>
        <span class="text-[10px] tracking-wider opacity-70">{{ difficultyLabel }}</span>
      </div>
    </div>

    <div class="p-5 flex-1 flex flex-col">
      <h3 class="text-base font-bold line-clamp-2 group-hover:text-primary transition-colors mb-1">
        {{ course.title }}
      </h3>
      <p class="text-[11px] text-slate-400 mb-4">Modifié {{ updatedAt }}</p>

      <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
        <div class="flex items-center gap-1.5">
          <component :is="statusIcon" :size="14" :class="statusIconColor" />
          <span class="text-xs font-bold" :class="statusTextColor">{{ statusLabel }}</span>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="course.status === 'PUBLISHED'"
            class="text-xs font-bold text-slate-500 hover:underline underline-offset-4 flex items-center gap-1"
            @click="$emit('feedback')"
          >
            <MessageCircle :size="12" />
            Avis &amp; Q&amp;A
          </button>
          <button
            class="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1"
            @click="$emit('open')"
          >
            {{ course.status === 'PUBLISHED' ? $t('instructor.settings') : $t('instructor.continue_learning') }}
            <ChevronRight :size="12" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronRight, LayoutList, BookOpen, FileEdit, CheckCircle2, MessageCircle } from 'lucide-vue-next'

const props = defineProps({
  course: { type: Object, required: true },
})

defineEmits(['open', 'feedback'])

const { t, locale } = useI18n()

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

const categoryLabel = computed(() => props.course.category?.name || t('common.general'))

const coverGradient = computed(() => GRADIENTS[props.course.id % GRADIENTS.length])

const lessonCount = computed(() =>
  props.course.modules.reduce((sum, m) => sum + (m._count?.lessons ?? 0), 0)
)

const statusLabel = computed(() =>
  props.course.status === 'PUBLISHED' ? t('common.published') : t('common.draft')
)
const statusBadge = computed(() => props.course.status === 'PUBLISHED' ? 'bg-green-500/90 text-white' : 'bg-yellow-400/90 text-yellow-900')
const statusIcon = computed(() => props.course.status === 'PUBLISHED' ? CheckCircle2 : FileEdit)
const statusIconColor = computed(() => props.course.status === 'PUBLISHED' ? 'text-green-500' : 'text-yellow-500')
const statusTextColor = computed(() => props.course.status === 'PUBLISHED' ? 'text-green-600' : 'text-yellow-600')

const dateLocale = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-US'))

const updatedAt = computed(() => {
  const date = new Date(props.course.updatedAt)
  const diff = Math.floor((Date.now() - date) / 1000)
  if (diff < 60) return t('common.just_now')
  if (diff < 3600) return locale.value === 'fr' ? `il y a ${Math.floor(diff / 60)} min` : `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return locale.value === 'fr' ? `il y a ${Math.floor(diff / 3600)}h` : `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString(dateLocale.value, { day: 'numeric', month: 'short' })
})
</script>
