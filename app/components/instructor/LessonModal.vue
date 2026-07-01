<template>
  <UiModal
    :open="open"
    :title="modalTitle"
    size="lg"
    @close="$emit('close')"
  >
    <div class="space-y-5">
      <div class="space-y-1.5">
        <label class="block text-sm font-bold text-slate-800">Titre de la leçon</label>
        <input
          v-model="form.title"
          type="text"
          class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
          :placeholder="titlePlaceholder"
        />
      </div>

      <template v-if="type === 'video'">
        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">URL de la vidéo</label>
          <input
            v-model="form.videoUrl"
            type="url"
            class="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
          />
          <p class="text-[10px] text-slate-400">Uploadez votre vidéo sur YouTube (non listé) ou Vimeo, puis collez le lien ici.</p>
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">Durée de la vidéo</label>
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
          <label class="block text-sm font-bold text-slate-800">Description (affichée sous la vidéo côté étudiant)</label>
          <UiRichTextEditor v-model="form.videoDescription" placeholder="Résumé, ressources, notes…" min-height="180px" />
        </div>
      </template>

      <template v-else-if="type === 'text'">
        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">Contenu</label>
          <UiRichTextEditor v-model="form.textContent" placeholder="Rédigez votre leçon…" min-height="240px" />
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">Durée estimée de lecture</label>
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
            <p v-else class="text-sm font-bold text-slate-400">Cliquez pour sélectionner un PDF</p>
            <input ref="pdfFileInput" type="file" accept=".pdf" class="hidden" @change="handlePdfFile" />
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">Durée estimée de lecture</label>
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
        <div class="space-y-1.5">
          <label class="block text-sm font-bold text-slate-800">Durée estimée</label>
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

          <div
            v-for="(question, qIdx) in form.questions"
            :key="qIdx"
            class="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50"
          >
            <div class="flex items-start gap-2">
              <span class="text-[10px] font-black uppercase text-slate-400 mt-3 shrink-0 w-5">Q{{ qIdx + 1 }}</span>
              <input
                v-model="question.text"
                type="text"
                placeholder="Saisissez votre question…"
                class="flex-1 h-10 px-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
              />
              <button
                v-if="form.questions.length > 1"
                class="mt-1 p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors shrink-0"
                type="button"
                @click="removeQuestion(qIdx)"
              >
                <Trash2 :size="14" />
              </button>
            </div>

            <div class="space-y-2 pl-7">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Options — sélectionnez la bonne réponse</p>
              <div
                v-for="(option, oIdx) in question.options"
                :key="oIdx"
                class="flex items-center gap-2"
              >
                <button
                  type="button"
                  class="size-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                  :class="option.isCorrect ? 'border-green-500 bg-white' : 'border-slate-300 bg-white hover:border-green-400'"
                  @click="setCorrect(qIdx, oIdx)"
                >
                  <span v-if="option.isCorrect" class="size-2 rounded-full bg-green-500" />
                </button>
                <input
                  v-model="option.text"
                  type="text"
                  :placeholder="`Option ${oIdx + 1}`"
                  class="flex-1 h-9 px-3 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-green-300 transition-all"
                  :class="option.isCorrect ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'"
                />
                <button
                  v-if="question.options.length > 2"
                  class="p-1 text-slate-300 hover:text-red-400 transition-colors shrink-0"
                  type="button"
                  @click="removeOption(qIdx, oIdx)"
                >
                  <X :size="12" />
                </button>
              </div>

              <button
                v-if="question.options.length < 5"
                class="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 mt-1"
                type="button"
                @click="addOption(qIdx)"
              >
                <Plus :size="11" />
                Ajouter une option
              </button>
            </div>
          </div>

          <button
            class="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary transition-all text-sm font-bold"
            type="button"
            @click="addQuestion"
          >
            <Plus :size="16" />
            Ajouter une question
          </button>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors"
          @click="$emit('close')"
        >
          Annuler
        </button>
        <button
          class="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
          :disabled="!isFormValid || saving"
          @click="handleSave"
        >
          {{ saving ? 'Upload en cours…' : isEditing ? 'Enregistrer' : 'Ajouter la leçon' }}
        </button>
      </div>
    </template>
  </UiModal>
</template>

<script setup>
import { FileText, Trash2, Plus, X } from 'lucide-vue-next'
import { parseDurationMinutes } from '~/utils/duration'

const props = defineProps({
  open: { type: Boolean, required: true },
  type: { type: String, default: null },
  editLesson: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save'])

const isEditing = computed(() => !!props.editLesson)

const modalTitle = computed(() => {
  if (isEditing.value) return 'Modifier la leçon'
  return {
    video: 'Ajouter une leçon vidéo',
    text: 'Ajouter une leçon texte',
    pdf: 'Ajouter un PDF',
    quiz: 'Ajouter un quiz QCM',
  }[props.type] ?? 'Ajouter une leçon'
})

const titlePlaceholder = computed(() => ({
  video: 'ex. Introduction à Nuxt 3',
  text: 'ex. Les fondamentaux de Vue',
  pdf: 'ex. Guide de référence',
  quiz: 'ex. Quiz : Les fondamentaux',
}[props.type] ?? 'Titre de la leçon'))

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
  questions: [defaultQuestion()],
})

const isFormValid = computed(() => {
  if (!form.title.trim()) return false
  if (props.type === 'pdf' && !props.editLesson && !form.pdfFile) return false
  if (props.type === 'quiz') {
    return form.questions.length > 0 && form.questions.every(q =>
      q.text.trim() &&
      q.options.filter(o => o.text.trim()).length >= 2 &&
      q.options.some(o => o.isCorrect),
    )
  }
  return true
})

watch(() => props.open, (val) => {
  if (!val) return
  if (props.editLesson) {
    const l = props.editLesson
    form.title = l.title ?? ''
    if (props.type === 'video') {
      form.videoUrl = l.url ?? ''
      form.videoDuration = parseDurationMinutes(l.meta) || 5
      form.videoDescription = l.content ?? ''
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

function addQuestion() {
  form.questions.push(defaultQuestion())
}

function removeQuestion(qIdx) {
  form.questions.splice(qIdx, 1)
}

function addOption(qIdx) {
  form.questions[qIdx].options.push({ text: '', isCorrect: false })
}

function removeOption(qIdx, oIdx) {
  const q = form.questions[qIdx]
  const wasCorrect = q.options[oIdx].isCorrect
  q.options.splice(oIdx, 1)
  if (wasCorrect && q.options.length > 0) {
    q.options[0].isCorrect = true
  }
}

function setCorrect(qIdx, oIdx) {
  form.questions[qIdx].options.forEach((o, i) => {
    o.isCorrect = i === oIdx
  })
}

async function handleSave() {
  if (!isFormValid.value) return

  const lesson = { title: form.title.trim(), type: props.type, meta: '' }

  if (props.type === 'video') {
    lesson.meta = form.videoDuration ? `${form.videoDuration} min` : '-'
    lesson.videoSource = 'url'
    lesson.videoUrl = form.videoUrl
    lesson.videoDescription = form.videoDescription
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
    lesson.questions = form.questions.map((q, qi) => ({
      text: q.text.trim(),
      order: qi,
      options: q.options.map((o, oi) => ({
        text: o.text.trim(),
        isCorrect: o.isCorrect,
        order: oi,
      })),
    }))
  }

  emit('save', lesson)
}
</script>
