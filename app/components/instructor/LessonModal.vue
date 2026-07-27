<template>
  <UiModal
    :open="open"
    :title="modalTitle"
    size="lg"
    @close="$emit('close')"
  >
    <div class="space-y-5">
      <div class="space-y-1.5">
        <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.lesson_modal.title_label') }}</label>
        <input
          v-model="form.title"
          type="text"
          class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
          :placeholder="titlePlaceholder"
        />
      </div>

      <template v-if="type === 'video'">
        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.lesson_modal.video_url') }}</label>
          <input
            v-model="form.videoUrl"
            type="url"
            class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
          />
          <p class="text-[10px] text-slate-400">{{ $t('instructor.lesson_modal.video_url_hint') }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.lesson_modal.video_duration') }}</label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="form.videoDuration"
              type="number"
              min="1"
              class="w-24 h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
            <span class="text-sm text-slate-500">minutes</span>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.lesson_modal.description_label') }}</label>
          <UiRichTextEditor v-model="form.videoDescription" :placeholder="$t('instructor.placeholders.lesson_video_desc')" min-height="180px" />
        </div>

        <InstructorAiQuizAgent
          v-if="isYouTubeUrl(form.videoUrl)"
          :url="form.videoUrl"
          v-model:question-count="ai.questionCount"
          :loading="ai.loading"
          :phase="ai.phase"
          :error="ai.error"
          :preview-count="ai.generated ? form.questions.filter(q => q.text.trim()).length : 0"
          :can-generate="!!form.videoUrl.trim()"
          @generate="generateAiQuiz"
        />

        <div v-if="ai.generated && type === 'video'" class="space-y-3 pt-1">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.lesson_modal.ai_preview') }}</label>
            <span class="text-[10px] text-slate-400">{{ form.questions.length }} question{{ form.questions.length > 1 ? 's' : '' }}</span>
          </div>
          <InstructorQuizQuestionsEditor v-model="form.questions" />
          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.lesson_modal.quiz_title') }}</label>
            <input
              v-model="form.quizTitle"
              type="text"
              class="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
              placeholder="ex. Quiz : Introduction"
            />
          </div>
        </div>
      </template>

      <template v-else-if="type === 'text'">
        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">Contenu</label>
          <UiRichTextEditor v-model="form.textContent" :placeholder="$t('instructor.placeholders.lesson_text')" min-height="240px" />
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.lesson_modal.read_duration') }}</label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="form.textDuration"
              type="number"
              min="1"
              class="w-24 h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
            <span class="text-sm text-slate-500">minutes</span>
          </div>
        </div>
      </template>

      <template v-else-if="type === 'pdf'">
        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">Fichier PDF</label>
          <div
            class="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
            @click="pdfFileInput?.click()"
          >
            <FileText :size="28" class="text-slate-300" />
            <div v-if="form.pdfFileName" class="text-center">
              <p class="text-sm font-bold text-slate-700">{{ form.pdfFileName }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">{{ form.pdfFileSize }}</p>
            </div>
            <div v-else-if="isEditing && props.editLesson?.url" class="text-center">
              <p class="text-sm font-bold text-slate-700">Fichier actuel</p>
              <p class="text-[10px] text-slate-400 mt-0.5">Cliquez pour remplacer</p>
            </div>
            <p v-else class="text-sm font-bold text-slate-400">{{ $t('instructor.lesson_modal.pick_pdf') }}</p>
            <input ref="pdfFileInput" type="file" accept=".pdf" class="hidden" @change="handlePdfFile" />
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.lesson_modal.read_duration') }}</label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="form.pdfDuration"
              type="number"
              min="1"
              class="w-24 h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
            <span class="text-sm text-slate-500">minutes</span>
          </div>
        </div>
      </template>

      <template v-else-if="type === 'quiz'">
        <InstructorAiQuizAgent
          v-model:url="ai.sourceUrl"
          v-model:question-count="ai.questionCount"
          show-url-field
          :loading="ai.loading"
          :phase="ai.phase"
          :error="ai.error"
          :preview-count="ai.generated ? form.questions.filter(q => q.text.trim()).length : 0"
          :can-generate="isYouTubeUrl(ai.sourceUrl)"
          @generate="generateAiQuiz"
        />

        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.lesson_modal.est_duration') }}</label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="form.quizDuration"
              type="number"
              min="1"
              class="w-24 h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
            <span class="text-sm text-slate-500">minutes</span>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-bold text-slate-800">Questions</label>
            <span class="text-[10px] text-slate-400">{{ form.questions.length }} question{{ form.questions.length > 1 ? 's' : '' }}</span>
          </div>
          <InstructorQuizQuestionsEditor v-model="form.questions" />
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-3">
        <button
          class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors"
          @click="$emit('close')"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          v-if="type === 'video' && ai.generated && !isEditing"
          class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
          :disabled="!isFormValid || saving"
          @click="handleSave"
        >
          {{ $t('instructor.lesson_modal.add_video_only') }}
        </button>
        <button
          v-if="type === 'video' && ai.generated && !isEditing"
          class="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40 shadow-md shadow-indigo-200"
          :disabled="!isFormValid || !isQuizValid || saving"
          @click="handleSaveWithQuiz"
        >
          Ajouter vidéo + quiz IA
        </button>
        <button
          v-else
          class="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
          :disabled="!isFormValid || saving"
          @click="handleSave"
        >
          {{ saving ? $t('common.loading') : saveLabel }}
        </button>
      </div>
    </template>
  </UiModal>
</template>

<script setup>
import { FileText } from 'lucide-vue-next'
import { parseDurationMinutes } from '~/utils/duration'
import { isYouTubeUrl } from '~/utils/videoEmbed'

const props = defineProps({
  open: { type: Boolean, required: true },
  type: { type: String, default: null },
  editLesson: { type: Object, default: null },
  courseTitle: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save', 'save-with-quiz'])

const { t } = useI18n()

const creation = useCourseCreation()

const isEditing = computed(() => !!props.editLesson)

const modalTitle = computed(() => {
  if (isEditing.value) return t('instructor.lesson_modal.edit')
  return {
    video: t('instructor.lesson_modal.add_video'),
    text: t('instructor.lesson_modal.add_text'),
    pdf: t('instructor.lesson_modal.add_lesson'),
    quiz: t('instructor.lesson_modal.add_lesson'),
  }[props.type] ?? t('instructor.lesson_modal.add_lesson')
})

const titlePlaceholder = computed(() => t('instructor.lesson_modal.title_placeholder'))

const saveLabel = computed(() => {
  if (isEditing.value) return t('common.save')
  if (props.type === 'video' && ai.generated) return t('instructor.lesson_modal.add_video_only')
  return t('instructor.lesson_modal.add_submit')
})

const pdfFileInput = ref(null)
const saving = ref(false)

function defaultQuestion() {
  return {
    text: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
    ],
  }
}

const form = reactive({
  title: '',
  videoUrl: '',
  videoDuration: 5,
  videoDescription: '',
  textContent: '',
  textDuration: 5,
  pdfFile: null,
  pdfFileName: '',
  pdfFileSize: '',
  pdfDuration: 10,
  quizDuration: 10,
  quizTitle: '',
  questions: [defaultQuestion()],
})

const ai = reactive({
  sourceUrl: '',
  questionCount: 5,
  loading: false,
  phase: 'idle',
  error: '',
  generated: false,
})

const isQuizValid = computed(() =>
  form.questions.length > 0 && form.questions.every(q =>
    q.text.trim() &&
    q.options.filter(o => o.text.trim()).length >= 2 &&
    q.options.some(o => o.isCorrect),
  ),
)

const isFormValid = computed(() => {
  if (!form.title.trim()) return false
  if (props.type === 'pdf' && !props.editLesson && !form.pdfFile) return false
  if (props.type === 'quiz') return isQuizValid.value
  return true
})

function resetAi() {
  Object.assign(ai, {
    sourceUrl: '',
    questionCount: 5,
    loading: false,
    phase: 'idle',
    error: '',
    generated: false,
  })
}

watch(() => props.open, (val) => {
  if (!val) return
  resetAi()
  if (props.editLesson) {
    const l = props.editLesson
    form.title = l.title ?? ''
    if (props.type === 'video') {
      form.videoUrl = l.url ?? ''
      form.videoDuration = parseDurationMinutes(l.meta) || 5
      form.videoDescription = l.content ?? ''
      form.quizTitle = ''
      form.questions = [defaultQuestion()]
    } else if (props.type === 'text') {
      form.textContent = l.content ?? ''
      form.textDuration = parseDurationMinutes(l.meta) || 5
    } else if (props.type === 'pdf') {
      form.pdfDuration = parseDurationMinutes(l.meta) || 10
      form.pdfFile = null
      form.pdfFileName = ''
      form.pdfFileSize = ''
    } else if (props.type === 'quiz') {
      form.quizDuration = parseDurationMinutes(l.meta) || 10
      form.questions = l.questions?.length
        ? l.questions.map(q => ({
            text: q.text,
            options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
          }))
        : [defaultQuestion()]
    }
  } else {
    Object.assign(form, {
      title: '',
      videoUrl: '',
      videoDuration: 5,
      videoDescription: '',
      textContent: '',
      textDuration: 5,
      pdfFile: null,
      pdfFileName: '',
      pdfFileSize: '',
      pdfDuration: 10,
      quizDuration: 10,
      quizTitle: '',
      questions: [defaultQuestion()],
    })
  }
})

function handlePdfFile(event) {
  const file = event.target.files[0]
  if (!file) return
  form.pdfFile = file
  form.pdfFileName = file.name
  const kb = Math.round(file.size / 1024)
  form.pdfFileSize = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
}

function mapQuestionsPayload() {
  return form.questions.map((q, qi) => ({
    text: q.text.trim(),
    order: qi,
    options: q.options.map((o, oi) => ({
      text: o.text.trim(),
      isCorrect: o.isCorrect,
      order: oi,
    })),
  }))
}

async function generateAiQuiz() {
  const url = props.type === 'video' ? form.videoUrl.trim() : ai.sourceUrl.trim()
  if (!isYouTubeUrl(url)) {
    ai.error = t('instructor.ai_quiz.gen_failed')
    return
  }

  ai.loading = true
  ai.error = ''
  ai.phase = 'transcript'
  ai.generated = false

  await new Promise(r => setTimeout(r, 450))
  ai.phase = 'generate'

  try {
    const result = await creation.generateQuizFromYoutube({
      url,
      questionCount: ai.questionCount,
      courseTitle: props.courseTitle || undefined,
      lessonTitle: form.title.trim() || undefined,
    })

    form.questions = result.questions.map(q => ({
      text: q.text,
      options: q.options.map(o => ({ text: o.text, isCorrect: !!o.isCorrect })),
    }))

    if (props.type === 'quiz' && !form.title.trim()) {
      form.title = result.quizTitle
    }
    if (props.type === 'video') {
      form.quizTitle = result.quizTitle || `Quiz : ${form.title || 'Vidéo'}`
    }

    ai.phase = 'done'
    ai.generated = true
  } catch (e) {
    ai.phase = 'idle'
    ai.error = e?.data?.statusMessage || e?.statusMessage || e?.message || t('instructor.ai_quiz.gen_failed')
  } finally {
    ai.loading = false
  }
}

function buildVideoLesson() {
  return {
    title: form.title.trim(),
    type: 'video',
    meta: form.videoDuration ? `${form.videoDuration} min` : '-',
    videoSource: 'url',
    videoUrl: form.videoUrl,
    videoDescription: form.videoDescription,
  }
}

function buildQuizLesson() {
  return {
    title: (form.quizTitle || form.title || 'Quiz').trim(),
    type: 'quiz',
    meta: `${form.quizDuration} min`,
    questions: mapQuestionsPayload(),
  }
}

async function handleSave() {
  if (!isFormValid.value) return

  const lesson = { title: form.title.trim(), type: props.type, meta: '' }

  if (props.type === 'video') {
    Object.assign(lesson, buildVideoLesson())
  } else if (props.type === 'text') {
    lesson.meta = `${form.textDuration} min`
    lesson.content = form.textContent
  } else if (props.type === 'pdf') {
    if (form.pdfFile) {
      saving.value = true
      try {
        const fd = new FormData()
        fd.append('file', form.pdfFile)
        const result = await $fetch('/api/upload', { method: 'POST', body: fd })
        lesson.url = result.url
      } finally {
        saving.value = false
      }
    } else if (props.editLesson?.url) {
      lesson.url = props.editLesson.url
    }
    lesson.meta = form.pdfFileSize
      ? `${form.pdfDuration} min • ${form.pdfFileSize}`
      : `${form.pdfDuration} min`
  } else if (props.type === 'quiz') {
    lesson.meta = `${form.quizDuration} min`
    lesson.questions = mapQuestionsPayload()
  }

  emit('save', lesson)
}

function handleSaveWithQuiz() {
  if (!isFormValid.value || !isQuizValid.value) return
  emit('save-with-quiz', {
    video: buildVideoLesson(),
    quiz: buildQuizLesson(),
  })
}
</script>
