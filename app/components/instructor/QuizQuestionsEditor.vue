<template>
  <div class="space-y-3">
    <div
      v-for="(question, qIdx) in model"
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
          v-if="model.length > 1"
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

<script setup>
import { Trash2, Plus, X } from 'lucide-vue-next'

const model = defineModel({ type: Array, required: true })

function defaultQuestion() {
  return {
    text: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
    ],
  }
}

function addQuestion() {
  model.value.push(defaultQuestion())
}

function removeQuestion(qIdx) {
  model.value.splice(qIdx, 1)
}

function addOption(qIdx) {
  model.value[qIdx].options.push({ text: '', isCorrect: false })
}

function removeOption(qIdx, oIdx) {
  const q = model.value[qIdx]
  const wasCorrect = q.options[oIdx].isCorrect
  q.options.splice(oIdx, 1)
  if (wasCorrect && q.options.length > 0) {
    q.options[0].isCorrect = true
  }
}

function setCorrect(qIdx, oIdx) {
  model.value[qIdx].options.forEach((o, i) => {
    o.isCorrect = i === oIdx
  })
}
</script>
