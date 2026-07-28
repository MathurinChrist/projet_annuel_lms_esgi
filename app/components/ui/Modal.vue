<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex"
      :class="position === 'right' ? 'justify-end' : 'items-center justify-center p-4'"
    >
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
        <Transition :name="position === 'right' ? 'ui-modal-slide' : undefined" appear>
          <div
            class="relative bg-white shadow-2xl flex flex-col"
            :class="position === 'right'
              ? 'h-full w-full sm:w-[420px] rounded-none'
              : ['rounded-2xl w-full max-h-[90vh]', sizeClass]"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <h2 class="font-bold text-base">{{ title }}</h2>
              <button class="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" @click="$emit('close')">
                <X :size="18" class="text-slate-400" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-5">
              <slot />
            </div>

            <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-200 shrink-0">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  size: { type: String, default: 'md' },
  position: { type: String, default: 'center' }, // 'center' | 'right'
})

const emit = defineEmits(['close'])

const sizeClass = computed(() => ({
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}[props.size] ?? 'max-w-lg'))

function onKeydown(e) {
  if (e.key === 'Escape' && props.open) emit('close')
}

watch(() => props.open, (val) => {
  if (val) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.ui-modal-slide-enter-active,
.ui-modal-slide-leave-active {
  transition: transform 0.2s ease;
}
.ui-modal-slide-enter-from,
.ui-modal-slide-leave-to {
  transform: translateX(100%);
}
</style>

