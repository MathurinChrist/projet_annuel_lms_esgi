<template>
  <button
    type="button"
    class="w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col gap-2"
    @click="$emit('open')"
  >
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-bold text-sm text-slate-900 line-clamp-1 flex-1">
        {{ note.title || $t('notes.untitled') }}
      </h3>
      <button
        type="button"
        class="p-1 text-slate-300 hover:text-red-500 transition-colors shrink-0"
        @click.stop="$emit('delete')"
      >
        <Trash2 :size="14" />
      </button>
    </div>

    <p class="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
      {{ preview || $t('notes.card.no_content') }}
    </p>

    <div class="flex items-center gap-1.5 flex-wrap">
      <span
        v-if="note.course"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold"
      >
        <BookOpen :size="10" />
        <span class="max-w-[120px] truncate">{{ note.lesson?.title || note.course.title }}</span>
      </span>
      <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold">
        {{ $t('notes.editor.free_note') }}
      </span>
      <span
        v-for="tag in note.tags"
        :key="tag"
        class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold"
      >
        {{ tag }}
      </span>
    </div>

    <p class="text-[10px] text-slate-400">{{ relativeDate }}</p>
  </button>
</template>

<script setup>
import { Trash2, BookOpen } from 'lucide-vue-next'
import { stripHtml } from '~/utils/html'

const props = defineProps({
  note: { type: Object, required: true },
})

defineEmits(['open', 'delete'])

const preview = computed(() => stripHtml(props.note.content).slice(0, 140))

const relativeDate = computed(() => {
  const date = new Date(props.note.updatedAt)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
})
</script>
