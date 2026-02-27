<template>
  <div class="flex items-end justify-between">
    <div>
      <h1 class="text-3xl font-bold text-slate-900 mb-2">{{ $t('dashboard.welcome', { name: userName }) }}</h1>
      <p class="text-slate-500">
        <i18n-t keypath="dashboard.goal" tag="span">
          <template #percent>
            <span class="text-blue-600 font-bold">85%</span>
          </template>
        </i18n-t>
      </p>
    </div>
    <div class="bg-white p-2 rounded-xl border border-slate-200 flex gap-1 shadow-sm">
      <button v-for="t in [
        { key: '7', label: $t('dashboard.last_7_days') },
        { key: '30', label: $t('dashboard.last_30_days') }
      ]" :key="t.key" 
        class="px-4 py-2 text-xs font-bold rounded-lg transition-all"
        :class="t.key === '7' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'">
        {{ t.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const userName = computed(() => user.value?.name?.split(' ')[0] || 'Alex');
</script>
