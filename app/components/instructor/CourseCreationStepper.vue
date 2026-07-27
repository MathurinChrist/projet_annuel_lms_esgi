<template>
  <div class="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
    <div class="flex items-center justify-between mb-3">
      <p class="font-bold text-sm text-slate-700">Progression de la création</p>
      <p class="text-primary font-bold text-sm">Étape {{ currentStep }} sur {{ steps.length }} ({{ percentage }}%)</p>
    </div>

    <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
      <div
        class="h-full bg-primary rounded-full transition-all duration-500"
        :style="{ width: percentage + '%' }"
      />
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        v-for="(step, index) in steps"
        :key="step.label"
        :class="[
          index + 1 === currentStep ? 'step-active' :
          index + 1 < currentStep ? 'step-done' :
          'step-pending'
        ]"
      >
        <div class="flex items-center gap-2">
          <component :is="step.icon" :size="16" />
          <span class="text-xs font-bold uppercase tracking-wide truncate">{{ step.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentStep: { type: Number, required: true },
  steps: { type: Array, required: true },
})

const percentage = computed(() => Math.round((props.currentStep / props.steps.length) * 100))
</script>
