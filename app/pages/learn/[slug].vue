<template>
  <div>
    <div v-if="pending" class="animate-pulse space-y-6">
      <div class="h-6 bg-slate-100 rounded w-1/3" />
      <div class="h-40 bg-slate-100 rounded-2xl" />
    </div>

    <div v-else-if="course">
      <!-- En-tête -->
      <div class="mb-6">
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Dashboard</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold truncate max-w-xs">{{ course.title }}</span>
        </nav>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 class="text-2xl font-black tracking-tight text-slate-900">{{ course.title }}</h1>
          <div class="flex items-center gap-3 shrink-0">
            <div class="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all" :style="{ width: `${progress}%` }" />
            </div>
            <span class="text-xs font-bold text-slate-500 shrink-0">{{ progress }}% • {{ completedCount }}/{{ allLessons.length }} leçons</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Contenu de la leçon active -->
        <div class="lg:col-span-2 space-y-4">
          <div v-if="activeLesson" class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div class="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="size-9 flex items-center justify-center rounded-lg shrink-0" :class="LESSON_TYPE_CONFIG[activeLesson.type].bg">
                  <component :is="LESSON_TYPE_CONFIG[activeLesson.type].icon" :size="18" :class="LESSON_TYPE_CONFIG[activeLesson.type].color" />
                </div>
                <div>
                  <h2 class="font-bold text-slate-900">{{ activeLesson.title }}</h2>
                  <p class="text-[11px] text-slate-400">{{ LESSON_TYPE_CONFIG[activeLesson.type].label }} • {{ activeLesson.duration || '-' }}</p>
                </div>
              </div>
              <button
                v-if="activeLesson.type !== 'quiz'"
                class="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-bold shrink-0 transition-colors"
                :class="activeLesson.completed
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'bg-primary text-white hover:bg-blue-700'"
                :disabled="toggling"
                @click="toggleComplete"
              >
                <CheckCircle2 :size="14" />
                {{ activeLesson.completed ? 'Terminé' : 'Marquer comme terminé' }}
              </button>
            </div>

            <div class="p-6">
              <!-- Vidéo -->
              <template v-if="activeLesson.type === 'video'">
                <div v-if="embedUrl" class="aspect-video rounded-xl overflow-hidden bg-black mb-4">
                  <iframe :src="embedUrl" class="w-full h-full" allowfullscreen frameborder="0" />
                </div>
                <div v-if="activeLesson.content" class="rendered-content" v-html="activeLesson.content" />
              </template>

              <!-- Texte -->
              <div v-else-if="activeLesson.type === 'text'" class="rendered-content" v-html="activeLesson.content" />

              <!-- PDF -->
              <template v-else-if="activeLesson.type === 'pdf'">
                <div v-if="activeLesson.url" class="rounded-xl overflow-hidden border border-slate-200 mb-4" style="height: 70vh">
                  <iframe :src="activeLesson.url" class="w-full h-full" />
                </div>
                <a
                  v-if="activeLesson.url"
                  :href="activeLesson.url"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 text-primary text-sm font-bold hover:underline"
                >
                  <Download :size="14" />
                  Ouvrir le PDF dans un nouvel onglet
                </a>
              </template>

              <!-- Quiz -->
              <div v-else-if="activeLesson.type === 'quiz'" class="space-y-5">
                <div
                  v-for="(question, qIdx) in activeLesson.questions"
                  :key="question.id"
                  class="border border-slate-200 rounded-xl p-4"
                >
                  <p class="text-sm font-bold text-slate-800 mb-3">{{ qIdx + 1 }}. {{ question.text }}</p>
                  <div class="space-y-2">
                    <label
                      v-for="option in question.options"
                      :key="option.id"
                      class="flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors"
                      :class="optionClass(question.id, option.id)"
                    >
                      <input
                        type="radio"
                        :name="`question-${question.id}`"
                        class="accent-primary"
                        :disabled="!!quizResult"
                        :checked="quizAnswers[question.id] === option.id"
                        @change="quizAnswers[question.id] = option.id"
                      />
                      <span class="text-sm">{{ option.text }}</span>
                      <CheckCircle2 v-if="quizResult && isCorrectOption(question.id, option.id)" :size="14" class="text-green-500 ml-auto shrink-0" />
                      <XCircle v-else-if="quizResult && quizAnswers[question.id] === option.id" :size="14" class="text-red-500 ml-auto shrink-0" />
                    </label>
                  </div>
                </div>

                <div v-if="quizResult" class="rounded-xl p-4 bg-primary/5 border border-primary/10 flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-700">Score : {{ quizResult.score }}/{{ quizResult.total }}</span>
                  <button class="text-xs font-bold text-primary hover:underline" @click="retakeQuiz">Recommencer</button>
                </div>
                <button
                  v-else
                  class="px-5 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
                  :disabled="!allQuestionsAnswered || submittingQuiz"
                  @click="submitQuiz"
                >
                  {{ submittingQuiz ? 'Validation…' : 'Valider le quiz' }}
                </button>
              </div>
            </div>

            <div class="p-5 border-t border-slate-100 flex justify-between">
              <button
                class="flex items-center gap-1.5 px-4 h-9 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                :disabled="!previousLesson"
                @click="previousLesson && selectLesson(previousLesson.id)"
              >
                <ChevronLeft :size="15" />
                Précédent
              </button>
              <button
                class="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-30 hover:bg-blue-700 transition-colors"
                :disabled="!nextLesson"
                @click="nextLesson && selectLesson(nextLesson.id)"
              >
                Suivant
                <ChevronRight :size="15" />
              </button>
            </div>
          </div>
        </div>

        <!-- Sommaire du cours -->
        <div class="space-y-3">
          <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm sticky top-6">
            <div class="p-4 border-b border-slate-100 flex items-center gap-2">
              <LayoutList :size="16" class="text-slate-400" />
              <h3 class="font-bold text-sm">Programme du cours</h3>
            </div>
            <div class="max-h-[70vh] overflow-y-auto">
              <div v-for="(module, mIdx) in course.modules" :key="module.id" class="border-b border-slate-50 last:border-0">
                <div class="px-4 py-3 bg-[#f8f9fc] text-[11px] font-bold text-slate-500 uppercase">
                  Module {{ String(mIdx + 1).padStart(2, '0') }} • {{ module.title }}
                </div>
                <button
                  v-for="lesson in module.lessons"
                  :key="lesson.id"
                  class="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  :class="lesson.id === activeLessonId ? 'bg-primary/5' : ''"
                  @click="selectLesson(lesson.id)"
                >
                  <CheckCircle2 v-if="lesson.completed" :size="16" class="text-green-500 shrink-0" />
                  <Circle v-else :size="16" class="text-slate-300 shrink-0" />
                  <component :is="LESSON_TYPE_CONFIG[lesson.type].icon" :size="14" :class="[LESSON_TYPE_CONFIG[lesson.type].color, 'shrink-0']" />
                  <span class="text-xs font-medium truncate flex-1" :class="lesson.id === activeLessonId ? 'text-primary font-bold' : 'text-slate-600'">
                    {{ lesson.title }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronRight, ChevronLeft, LayoutList, CheckCircle2, Circle, XCircle, Download } from 'lucide-vue-next'
import { LESSON_TYPE_CONFIG } from '~/utils/lessonTypes'
import { toEmbedUrl } from '~/utils/videoEmbed'

const route = useRoute()
const localePath = useLocalePath()
const student = useStudentCourse()

const slug = route.params.slug

function normalizeLesson(l) {
  return { ...l, type: l.type.toLowerCase() }
}

const course = ref(null)
const pending = ref(true)
const progress = ref(0)

const activeLessonId = ref(null)

onMounted(async () => {
  try {
    const data = await student.getCourse(slug)
    course.value = {
      ...data,
      modules: data.modules.map(m => ({ ...m, lessons: m.lessons.map(normalizeLesson) })),
    }
    progress.value = data.progress
    activeLessonId.value = allLessons.value.find(l => !l.completed)?.id ?? allLessons.value[0]?.id ?? null
  } catch {
    navigateTo(localePath('/'))
    return
  } finally {
    pending.value = false
  }
})

const allLessons = computed(() => course.value?.modules.flatMap(m => m.lessons) ?? [])
const completedCount = computed(() => allLessons.value.filter(l => l.completed).length)

const activeLesson = computed(() => allLessons.value.find(l => l.id === activeLessonId.value) ?? null)

const activeIndex = computed(() => allLessons.value.findIndex(l => l.id === activeLessonId.value))
const previousLesson = computed(() => activeIndex.value > 0 ? allLessons.value[activeIndex.value - 1] : null)
const nextLesson = computed(() => activeIndex.value >= 0 && activeIndex.value < allLessons.value.length - 1 ? allLessons.value[activeIndex.value + 1] : null)

const embedUrl = computed(() => activeLesson.value?.type === 'video' ? toEmbedUrl(activeLesson.value.url) : null)

function selectLesson(id) {
  activeLessonId.value = id
  quizResult.value = null
  quizAnswers.value = {}
}

const toggling = ref(false)
async function toggleComplete() {
  if (!activeLesson.value || toggling.value) return
  toggling.value = true
  try {
    const data = activeLesson.value.completed
      ? await student.uncompleteLesson(activeLesson.value.id)
      : await student.completeLesson(activeLesson.value.id)
    activeLesson.value.completed = data.completed
    progress.value = data.progress
  } finally {
    toggling.value = false
  }
}

const quizAnswers = ref({})
const quizResult = ref(null)
const submittingQuiz = ref(false)

const allQuestionsAnswered = computed(() =>
  activeLesson.value?.questions?.length > 0 &&
  activeLesson.value.questions.every(q => quizAnswers.value[q.id] != null)
)

function optionClass(questionId, optionId) {
  if (!quizResult.value) {
    return quizAnswers.value[questionId] === optionId ? 'border-primary bg-primary/5' : 'border-slate-200'
  }
  if (isCorrectOption(questionId, optionId)) return 'border-green-400 bg-green-50'
  if (quizAnswers.value[questionId] === optionId) return 'border-red-300 bg-red-50'
  return 'border-slate-200 opacity-60'
}

function isCorrectOption(questionId, optionId) {
  const result = quizResult.value?.results.find(r => r.questionId === questionId)
  return result?.correctOptionId === optionId
}

async function submitQuiz() {
  if (!activeLesson.value || submittingQuiz.value) return
  submittingQuiz.value = true
  try {
    const data = await student.submitQuiz(activeLesson.value.id, quizAnswers.value)
    quizResult.value = data
    activeLesson.value.completed = true
    progress.value = data.progress
  } finally {
    submittingQuiz.value = false
  }
}

function retakeQuiz() {
  quizResult.value = null
  quizAnswers.value = {}
}
</script>

<style scoped>
.rendered-content :deep(h1) { font-size: 1.5rem; font-weight: 800; margin: 1rem 0 0.5rem; }
.rendered-content :deep(h2) { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.rendered-content :deep(h3) { font-size: 1.05rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
.rendered-content :deep(p) { margin: 0.5rem 0; line-height: 1.7; }
.rendered-content :deep(ul) { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
.rendered-content :deep(ol) { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
.rendered-content :deep(a) { color: #135bec; text-decoration: underline; }
.rendered-content :deep(img) { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
.rendered-content :deep(blockquote) { border-left: 3px solid #e7ebf3; padding-left: 1rem; margin: 1rem 0; color: #4c669a; font-style: italic; }
.rendered-content :deep(code) { background: #f8f9fc; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.875rem; font-family: monospace; }
.rendered-content :deep(pre) { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; overflow-x: auto; }
</style>
