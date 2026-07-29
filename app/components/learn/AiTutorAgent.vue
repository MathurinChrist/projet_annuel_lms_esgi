<template>
  <div class="relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-sky-50">
    <div
      class="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-teal-200/30 blur-2xl"
      aria-hidden="true"
    />

    <div class="relative p-4 space-y-4">
      <div class="flex items-start gap-3">
        <div class="size-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-200 shrink-0">
          <Bot :size="18" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="text-sm font-black text-slate-900">{{ $t('learn.tutor.title') }}</h4>
            <span class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-700">Beta</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {{ $t('learn.tutor.subtitle') }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="h-8 px-3 rounded-lg text-xs font-bold transition-all"
          :class="mode === tab.id
            ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
            : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'"
          :disabled="loading"
          @click="mode = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Explain -->
      <div v-if="mode === 'explain'" class="space-y-3">
        <button
          type="button"
          class="w-full h-11 rounded-xl bg-teal-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-200 hover:bg-teal-700 transition-all disabled:opacity-50"
          :disabled="!lessonId || loading"
          @click="runExplain"
        >
          <Loader2 v-if="loading" :size="16" class="animate-spin" />
          <BookOpen v-else :size="16" />
          {{ loading ? $t('learn.tutor.working') : $t('learn.tutor.explain_cta') }}
        </button>
        <div v-if="explainReply" class="rounded-xl border border-teal-100 bg-white/80 px-3 py-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
          {{ explainReply }}
        </div>
      </div>

      <!-- Chat -->
      <div v-else-if="mode === 'chat'" class="space-y-3">
        <div ref="chatBox" class="max-h-56 overflow-y-auto space-y-2 rounded-xl border border-slate-100 bg-white/70 p-3">
          <p v-if="!messages.length" class="text-[11px] text-slate-400 text-center py-4">
            {{ $t('learn.tutor.chat_empty') }}
          </p>
          <div
            v-for="(m, i) in messages"
            :key="i"
            class="rounded-lg px-2.5 py-2 text-xs leading-relaxed whitespace-pre-wrap"
            :class="m.role === 'user'
              ? 'bg-teal-600 text-white ml-6'
              : 'bg-slate-100 text-slate-700 mr-6'"
          >
            {{ m.content }}
          </div>
        </div>
        <form class="flex gap-2" @submit.prevent="runChat">
          <input
            v-model="draft"
            type="text"
            class="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-teal-300/40 focus:border-teal-400"
            :placeholder="$t('learn.tutor.chat_placeholder')"
            :disabled="loading"
          />
          <button
            type="submit"
            class="h-10 px-3 rounded-xl bg-teal-600 text-white font-bold disabled:opacity-50"
            :disabled="!draft.trim() || loading || !lessonId"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <SendHorizonal v-else :size="16" />
          </button>
        </form>
      </div>

      <!-- Practice -->
      <div v-else class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-bold text-slate-500">{{ $t('learn.tutor.questions') }}</span>
          <button
            v-for="n in [3, 5, 8]"
            :key="n"
            type="button"
            class="h-8 min-w-8 px-2.5 rounded-lg text-xs font-bold transition-all"
            :class="questionCount === n
              ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'"
            :disabled="loading"
            @click="questionCount = n"
          >
            {{ n }}
          </button>
        </div>
        <button
          type="button"
          class="w-full h-11 rounded-xl bg-teal-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-200 hover:bg-teal-700 transition-all disabled:opacity-50"
          :disabled="!lessonId || loading"
          @click="runPractice"
        >
          <Loader2 v-if="loading" :size="16" class="animate-spin" />
          <Dumbbell v-else :size="16" />
          {{ loading ? $t('learn.tutor.working') : $t('learn.tutor.practice_cta') }}
        </button>

        <div v-if="practiceQuiz" class="space-y-3">
          <p class="text-xs font-black text-slate-800">{{ practiceQuiz.title }}</p>
          <div
            v-for="(q, qi) in practiceQuiz.questions"
            :key="qi"
            class="rounded-xl border border-slate-200 bg-white/90 p-3 space-y-2"
          >
            <p class="text-xs font-bold text-slate-800">{{ qi + 1 }}. {{ q.text }}</p>
            <button
              v-for="(o, oi) in q.options"
              :key="oi"
              type="button"
              class="w-full text-left text-xs px-2.5 py-2 rounded-lg border transition-colors"
              :class="practiceOptionClass(qi, oi)"
              :disabled="practiceAnswers[qi] != null"
              @click="answerPractice(qi, oi)"
            >
              {{ o.text }}
            </button>
            <p
              v-if="practiceAnswers[qi] != null"
              class="text-[11px] font-medium"
              :class="isPracticeCorrect(qi) ? 'text-emerald-600' : 'text-rose-600'"
            >
              {{ isPracticeCorrect(qi) ? $t('learn.tutor.correct') : $t('learn.tutor.incorrect') }}
            </p>
          </div>
          <p v-if="practiceDone" class="text-xs font-bold text-teal-700">
            {{ $t('learn.tutor.practice_score', { score: practiceScore, total: practiceQuiz.questions.length }) }}
          </p>
        </div>
      </div>

      <p v-if="error" class="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { Bot, BookOpen, Dumbbell, Loader2, SendHorizonal } from 'lucide-vue-next'

const props = defineProps({
  lessonId: { type: Number, default: null },
})

const { t, locale } = useI18n()
const token = useCookie('token')

const mode = ref('explain') // explain | chat | practice
const loading = ref(false)
const error = ref('')
const explainReply = ref('')
const draft = ref('')
const messages = ref([])
const chatBox = ref(null)
const questionCount = ref(5)
const practiceQuiz = ref(null)
const practiceAnswers = ref({})

const tabs = computed(() => [
  { id: 'explain', label: t('learn.tutor.tab_explain') },
  { id: 'chat', label: t('learn.tutor.tab_chat') },
  { id: 'practice', label: t('learn.tutor.tab_practice') },
])

watch(() => props.lessonId, () => {
  explainReply.value = ''
  messages.value = []
  practiceQuiz.value = null
  practiceAnswers.value = {}
  error.value = ''
  draft.value = ''
})

function authHeaders() {
  const jwt = token.value
  if (!jwt || jwt.split('.').length !== 3) return {}
  return { Authorization: `Bearer ${jwt}` }
}

async function callTutor(body) {
  return await $fetch('/api/student/ai/tutor', {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: {
      ...body,
      lessonId: props.lessonId,
      language: locale.value === 'en' ? 'en' : 'fr',
    },
  })
}

async function runExplain() {
  if (!props.lessonId || loading.value) return
  loading.value = true
  error.value = ''
  explainReply.value = ''
  try {
    const res = await callTutor({ mode: 'explain' })
    explainReply.value = res.reply
  } catch (e) {
    error.value = e?.data?.statusMessage || e?.statusMessage || e?.message || t('learn.tutor.error')
  } finally {
    loading.value = false
  }
}

async function runChat() {
  const text = draft.value.trim()
  if (!text || !props.lessonId || loading.value) return
  loading.value = true
  error.value = ''
  messages.value.push({ role: 'user', content: text })
  draft.value = ''
  await nextTick()
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  try {
    const history = messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.content }))
    const res = await callTutor({ mode: 'chat', message: text, history })
    messages.value.push({ role: 'assistant', content: res.reply })
    await nextTick()
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  } catch (e) {
    messages.value.pop()
    error.value = e?.data?.statusMessage || e?.statusMessage || e?.message || t('learn.tutor.error')
  } finally {
    loading.value = false
  }
}

async function runPractice() {
  if (!props.lessonId || loading.value) return
  loading.value = true
  error.value = ''
  practiceQuiz.value = null
  practiceAnswers.value = {}
  try {
    const res = await callTutor({ mode: 'practice', questionCount: questionCount.value })
    practiceQuiz.value = res.quiz
  } catch (e) {
    error.value = e?.data?.statusMessage || e?.statusMessage || e?.message || t('learn.tutor.error')
  } finally {
    loading.value = false
  }
}

function answerPractice(qi, oi) {
  if (practiceAnswers.value[qi] != null) return
  practiceAnswers.value = { ...practiceAnswers.value, [qi]: oi }
}

function isPracticeCorrect(qi) {
  const q = practiceQuiz.value?.questions?.[qi]
  const oi = practiceAnswers.value[qi]
  return q?.options?.[oi]?.isCorrect === true
}

function practiceOptionClass(qi, oi) {
  const answered = practiceAnswers.value[qi] != null
  const q = practiceQuiz.value?.questions?.[qi]
  if (!answered) {
    return 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
  }
  if (q?.options?.[oi]?.isCorrect) return 'border-emerald-400 bg-emerald-50'
  if (practiceAnswers.value[qi] === oi) return 'border-rose-300 bg-rose-50'
  return 'border-slate-200 opacity-50'
}

const practiceDone = computed(() => {
  const n = practiceQuiz.value?.questions?.length || 0
  return n > 0 && Object.keys(practiceAnswers.value).length >= n
})

const practiceScore = computed(() => {
  if (!practiceQuiz.value) return 0
  return practiceQuiz.value.questions.reduce((sum, _q, qi) => sum + (isPracticeCorrect(qi) ? 1 : 0), 0)
})
</script>
