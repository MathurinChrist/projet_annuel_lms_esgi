<template>
  <div class="space-y-4">
    <input
      v-model="form.title"
      type="text"
      class="w-full text-base font-bold rounded-lg border border-slate-200 px-3 h-11 outline-none focus:border-primary transition-colors"
      :placeholder="$t('notes.editor.title_placeholder')"
    />

    <UiRichTextEditor v-model="form.content" :placeholder="$t('notes.editor.content_placeholder')" :min-height="minHeight" />

    <div class="flex items-center gap-1.5 flex-wrap">
      <span
        v-for="(tag, idx) in form.tags"
        :key="tag"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold"
      >
        {{ tag }}
        <button type="button" class="hover:text-red-500" @click="form.tags.splice(idx, 1)">
          <X :size="11" />
        </button>
      </span>
      <input
        v-model="tagInput"
        type="text"
        class="text-xs px-2 h-7 rounded-full border border-dashed border-slate-300 outline-none focus:border-primary w-28"
        :placeholder="$t('notes.editor.tag_placeholder')"
        @keydown.enter.prevent="addTag"
        @keydown.backspace="onTagBackspace"
      />
    </div>

    <NotesNoteAttachmentControl
      :course-id="form.courseId"
      :lesson-id="form.lessonId"
      :course="form.course"
      :lesson="form.lesson"
      @change="onAttachmentChange"
    />

    <div class="flex items-center justify-end gap-2 pt-1">
      <button type="button" class="px-4 h-9 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors" @click="$emit('cancel')">
        {{ $t('notes.editor.cancel') }}
      </button>
      <button
        type="button"
        class="px-4 h-9 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
        :disabled="saving"
        @click="save"
      >
        {{ saving ? $t('notes.editor.saving') : $t('notes.editor.save') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { X } from 'lucide-vue-next'

const props = defineProps({
  note: { type: Object, default: null },
  context: { type: String, default: 'free' }, // 'lesson' | 'course' | 'free'
  lockedCourseId: { type: Number, default: null },
  lockedLessonId: { type: Number, default: null },
  lockedCourse: { type: Object, default: null },
  lockedLesson: { type: Object, default: null },
  minHeight: { type: String, default: '220px' },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['save', 'cancel'])

function buildInitialForm() {
  if (props.note) {
    return {
      title: props.note.title || '',
      content: props.note.content || '',
      tags: [...(props.note.tags || [])],
      courseId: props.note.courseId ?? null,
      lessonId: props.note.lessonId ?? null,
      course: props.note.course ?? null,
      lesson: props.note.lesson ?? null,
    }
  }
  return {
    title: '',
    content: '',
    tags: [],
    courseId: props.lockedCourseId ?? null,
    lessonId: props.lockedLessonId ?? null,
    course: props.lockedCourse ?? null,
    lesson: props.lockedLesson ?? null,
  }
}

const form = reactive(buildInitialForm())
const tagInput = ref('')

function addTag() {
  const value = tagInput.value.trim()
  if (value && !form.tags.includes(value)) {
    form.tags.push(value)
  }
  tagInput.value = ''
}

function onTagBackspace() {
  if (!tagInput.value && form.tags.length) {
    form.tags.pop()
  }
}

function onAttachmentChange({ courseId, lessonId }) {
  form.courseId = courseId
  form.lessonId = lessonId
  if (!courseId) {
    form.course = null
    form.lesson = null
  }
}

function save() {
  if (tagInput.value.trim()) addTag()
  emit('save', {
    title: form.title.trim() || null,
    content: form.content,
    tags: form.tags,
    courseId: form.courseId,
    lessonId: form.lessonId,
  })
}
</script>
