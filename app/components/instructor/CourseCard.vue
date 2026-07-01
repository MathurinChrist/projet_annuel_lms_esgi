<template>
  <div
    class="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col"
  >
    <!-- Visuel -->
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

    <!-- Contenu de la carte -->
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
        <button
          class="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1"
          @click="$emit('open')"
        >
          {{ course.status === 'PUBLISHED' ? 'Paramètres' : 'Continuer' }}
          <ChevronRight :size="12" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronRight, LayoutList, BookOpen, FileEdit, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps({
  course: { type: Object, required: true },
})

defineEmits(['open'])

const DIFFICULTY_LABELS = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
}

const GRADIENTS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-violet-500 to-purple-700',
  'bg-gradient-to-br from-sky-400 to-blue-600',
  'bg-gradient-to-br from-emerald-400 to-teal-600',
  'bg-gradient-to-br from-orange-400 to-rose-500',
  'bg-gradient-to-br from-pink-400 to-fuchsia-600',
]

const difficultyLabel = computed(() =>
  DIFFICULTY_LABELS[props.course.difficulty?.toUpperCase()] ?? props.course.difficulty
)

const categoryLabel = computed(() => props.course.category?.name || 'Général')

const coverGradient = computed(() => GRADIENTS[props.course.id % GRADIENTS.length])

const lessonCount = computed(() =>
  props.course.modules.reduce((sum, m) => sum + (m._count?.lessons ?? 0), 0)
)

const statusLabel = computed(() => props.course.status === 'PUBLISHED' ? 'Publié' : 'Brouillon')
const statusBadge = computed(() => props.course.status === 'PUBLISHED' ? 'bg-green-500/90 text-white' : 'bg-yellow-400/90 text-yellow-900')
const statusIcon = computed(() => props.course.status === 'PUBLISHED' ? CheckCircle2 : FileEdit)
const statusIconColor = computed(() => props.course.status === 'PUBLISHED' ? 'text-green-500' : 'text-yellow-500')
const statusTextColor = computed(() => props.course.status === 'PUBLISHED' ? 'text-green-600' : 'text-yellow-600')

const updatedAt = computed(() => {
  const date = new Date(props.course.updatedAt)
  const diff = Math.floor((Date.now() - date) / 1000)
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
})
</script>
