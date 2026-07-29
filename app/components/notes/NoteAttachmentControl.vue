<template>
  <div class="text-sm">
    <div v-if="courseId" class="flex items-center gap-2 flex-wrap">
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
        <BookOpen :size="12" />
        {{ course?.title || $t('notes.editor.unknown_course') }}
        <template v-if="lessonId">
          <ChevronRight :size="11" />
          {{ lesson?.title || $t('notes.editor.unknown_lesson') }}
        </template>
      </span>
      <button type="button" class="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors" @click="detach">
        {{ $t('notes.editor.detach') }}
      </button>
    </div>

    <div v-else>
      <div v-if="!picking" class="flex items-center gap-2 flex-wrap">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
          {{ $t('notes.editor.free_note') }}
        </span>
        <button type="button" class="text-xs font-bold text-primary hover:underline" @click="openPicker">
          {{ $t('notes.editor.attach') }}
        </button>
      </div>

      <div v-else class="flex flex-wrap items-center gap-2">
        <select
          v-model="pickCourseId"
          class="h-8 pl-2.5 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          @change="pickLessonId = null"
        >
          <option :value="null">{{ $t('notes.editor.pick_course') }}</option>
          <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }}</option>
        </select>
        <select
          v-if="pickCourseId"
          v-model="pickLessonId"
          class="h-8 pl-2.5 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option :value="null">{{ $t('notes.editor.whole_course') }}</option>
          <option v-for="l in lessonsForPickedCourse" :key="l.id" :value="l.id">{{ l.title }}</option>
        </select>
        <button
          type="button"
          class="h-8 px-3 rounded-lg bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
          :disabled="!pickCourseId"
          @click="confirmAttach"
        >
          {{ $t('notes.editor.confirm') }}
        </button>
        <button type="button" class="h-8 px-3 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600" @click="picking = false">
          {{ $t('notes.editor.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookOpen, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  courseId: { type: Number, default: null },
  lessonId: { type: Number, default: null },
  course: { type: Object, default: null },
  lesson: { type: Object, default: null },
})

const emit = defineEmits(['change'])

const student = useStudentCourse()

const picking = ref(false)
const courses = ref([])
const pickCourseId = ref(null)
const pickLessonId = ref(null)
const courseLessons = ref({})

async function openPicker() {
  picking.value = true
  pickCourseId.value = null
  pickLessonId.value = null
  if (!courses.value.length) {
    try {
      const enrollments = await student.getEnrollments()
      courses.value = enrollments.map(e => e.course)
    } catch {
      courses.value = []
    }
  }
}

const lessonsForPickedCourse = computed(() => courseLessons.value[pickCourseId.value] || [])

watch(pickCourseId, async (id) => {
  if (!id || courseLessons.value[id]) return
  const c = courses.value.find(c => c.id === id)
  if (!c) return
  try {
    const data = await student.getCourse(c.slug)
    courseLessons.value = {
      ...courseLessons.value,
      [id]: data.modules.flatMap(m => m.lessons),
    }
  } catch {
    courseLessons.value = { ...courseLessons.value, [id]: [] }
  }
})

function confirmAttach() {
  if (!pickCourseId.value) return
  emit('change', { courseId: pickCourseId.value, lessonId: pickLessonId.value })
  picking.value = false
}

function detach() {
  emit('change', { courseId: null, lessonId: null })
}
</script>
