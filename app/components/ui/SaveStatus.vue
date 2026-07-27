<template>
  <Transition
    enter-active-class="transition-all duration-200"
    enter-from-class="opacity-0 translate-y-1"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-1"
  >
    <span
      v-if="isDirty || error"
      class="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
      :class="error
        ? 'text-red-600 bg-red-50 border border-red-200'
        : 'text-amber-700 bg-amber-50 border border-amber-200'"
    >
      <span
        class="size-1.5 rounded-full animate-pulse"
        :class="error ? 'bg-red-500' : 'bg-amber-500'"
      />
      {{ error || $t('ui.unsaved') }}
    </span>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  isDirty?: boolean
  error?: string
}>()
</script>
