<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{{ $t('dashboard.welcome', { name: userName }) }}</h1>
      <p class="text-slate-500">
        <i18n-t keypath="dashboard.goal" tag="span">
          <template #percent>
            <span class="text-blue-600 font-bold">{{ goalPercent }}%</span>
          </template>
        </i18n-t>
      </p>
    </div>
    <div class="bg-white p-1.5 sm:p-2 rounded-xl border border-slate-200 flex gap-1 shadow-sm">
      <button v-for="t in [
        { key: '7', label: $t('dashboard.last_7_days') },
        { key: '30', label: $t('dashboard.last_30_days') }
      ]" :key="t.key"
        type="button"
        class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all"
        :class="t.key === activeRange ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'"
        @click="$emit('range-change', t.key)">
        {{ t.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';

const props = defineProps({
  goalPercent: { type: Number, default: 0 },
  activeRange: { type: String, default: '7' },
});

defineEmits(['range-change']);

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const userName = computed(() => user.value?.firstName || 'Alex');
const goalPercent = computed(() => props.goalPercent);
</script>
