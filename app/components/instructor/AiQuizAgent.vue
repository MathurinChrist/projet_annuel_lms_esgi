<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50"
  >
    <div
      class="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-indigo-200/30 blur-2xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-sky-200/40 blur-2xl"
      aria-hidden="true"
    />

    <div class="relative p-4 space-y-4">
      <div class="flex items-start gap-3">
        <div class="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
          <Sparkles :size="18" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="text-sm font-black text-slate-900">Agent IA formateur</h4>
            <span class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">Beta</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Je lis la transcription YouTube (ou j’analyse la vidéo si les sous-titres sont bloqués) et je prépare un quiz QCM. Vous gardez le contrôle avant d’enregistrer.
          </p>
        </div>
      </div>

      <div v-if="showUrlField" class="space-y-1.5">
        <label class="block text-[11px] font-bold text-slate-600">Lien YouTube source</label>
        <div class="relative">
          <Youtube :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
          <input
            :value="url"
            type="url"
            class="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white/80 focus:ring-2 focus:ring-indigo-300/40 focus:border-indigo-400 outline-none text-sm transition-all"
            placeholder="https://www.youtube.com/watch?v=…"
            :disabled="loading"
            @input="onUrlInput"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <button
          type="button"
          class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          @click="showTranscript = !showTranscript"
        >
          {{ showTranscript ? $t('instructor.ai_quiz.hide_transcript') : $t('instructor.ai_quiz.paste_transcript') }}
        </button>
        <div v-if="showTranscript || forceTranscript" class="space-y-1">
          <textarea
            :value="transcript"
            rows="4"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/80 focus:ring-2 focus:ring-indigo-300/40 focus:border-indigo-400 outline-none text-xs transition-all resize-y"
            :placeholder="$t('instructor.ai_quiz.transcript_placeholder')"
            :disabled="loading"
            @input="onTranscriptInput"
          />
          <p class="text-[10px] text-slate-400 leading-relaxed">
            {{ $t('instructor.ai_quiz.transcript_hint') }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="text-[11px] font-bold text-slate-500">Questions</span>
        <button
          v-for="n in questionChoices"
          :key="n"
          type="button"
          class="h-8 min-w-8 px-2.5 rounded-lg text-xs font-bold transition-all"
          :class="questionCount === n
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
            : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'"
          :disabled="loading"
          @click="$emit('update:questionCount', n)"
        >
          {{ n }}
        </button>
      </div>

      <div v-if="loading || phase === 'done'" class="space-y-2.5">
        <div
          v-for="step in steps"
          :key="step.id"
          class="flex items-center gap-2.5"
        >
          <div
            class="size-6 rounded-full flex items-center justify-center shrink-0 transition-all"
            :class="stepStatusClass(step.id)"
          >
            <Loader2 v-if="phase === step.id && step.id !== 'done'" :size="12" class="animate-spin" />
            <Check v-else-if="isStepDone(step.id) || (phase === 'done' && step.id === 'done')" :size="12" />
            <span v-else class="size-1.5 rounded-full bg-current opacity-40" />
          </div>
          <span
            class="text-xs font-medium transition-colors"
            :class="phase === step.id || isStepDone(step.id) ? 'text-slate-800' : 'text-slate-400'"
          >
            {{ step.label }}
          </span>
        </div>
      </div>

      <p v-if="error" class="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
        {{ error }}
      </p>

      <div v-if="phase === 'done' && previewCount > 0" class="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 flex items-center gap-2">
        <CheckCircle2 :size="16" class="text-emerald-600 shrink-0" />
        <div class="min-w-0">
          <p class="text-xs text-emerald-800 font-medium">
            {{ t('instructor.ai_quiz.ready_preview', previewCount, { count: previewCount }) }}
          </p>
          <p v-if="fromVideo" class="text-[10px] text-emerald-700/80 mt-0.5">
            {{ t('instructor.ai_quiz.ready_from_video') }}
          </p>
        </div>
      </div>

      <button
        type="button"
        class="w-full h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canGenerate || loading"
        @click="$emit('generate')"
      >
        <Loader2 v-if="loading" :size="16" class="animate-spin" />
        <Wand2 v-else :size="16" />
        {{ loading ? $t('instructor.ai_quiz.generating') : phase === 'done' ? $t('instructor.ai_quiz.regenerate') : $t('instructor.ai_quiz.generate') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { Sparkles, Youtube, Wand2, Loader2, Check, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps({
  url: { type: String, default: '' },
  transcript: { type: String, default: '' },
  questionCount: { type: Number, default: 5 },
  showUrlField: { type: Boolean, default: false },
  forceTranscript: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  phase: { type: String, default: 'idle' }, // idle | transcript | generate | done
  error: { type: String, default: '' },
  previewCount: { type: Number, default: 0 },
  canGenerate: { type: Boolean, default: false },
  fromVideo: { type: Boolean, default: false },
})

const emit = defineEmits(['update:url', 'update:transcript', 'update:questionCount', 'generate'])

const { t } = useI18n()
const showTranscript = ref(false)

watch(() => props.forceTranscript, (v) => {
  if (v) showTranscript.value = true
}, { immediate: true })

const questionChoices = [3, 5, 8]

function onUrlInput(event) {
  emit('update:url', event.target.value)
}

function onTranscriptInput(event) {
  emit('update:transcript', event.target.value)
}

const steps = computed(() => [
  { id: 'transcript', label: t('instructor.ai_quiz.step_transcript') },
  { id: 'generate', label: t('instructor.ai_quiz.generate') },
  { id: 'done', label: t('instructor.ai_quiz.step_done') },
])

const order = { idle: 0, transcript: 1, generate: 2, done: 3 }

function isStepDone(stepId) {
  return (order[props.phase] || 0) > (order[stepId] || 0) || props.phase === 'done'
}

function stepStatusClass(stepId) {
  if (props.phase === 'done' && stepId === 'done') return 'bg-emerald-500 text-white'
  if (props.phase === stepId) return 'bg-indigo-600 text-white'
  if (isStepDone(stepId)) return 'bg-emerald-500 text-white'
  return 'bg-slate-100 text-slate-400'
}
</script>
