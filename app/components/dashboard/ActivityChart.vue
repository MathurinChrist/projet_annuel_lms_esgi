<template>
  <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
    <div class="flex items-center justify-between mb-8">
      <h3 class="text-lg font-bold text-slate-900">{{ $t('dashboard.learning_activity') }}</h3>
      <select class="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-3 py-2 outline-none cursor-pointer">
        <option>{{ $t('dashboard.this_week') }}</option>
        <option>{{ $t('dashboard.last_month') }}</option>
      </select>
    </div>
    <div class="flex items-end justify-between h-48 gap-4 px-2">
      <div v-for="(day, i) in weekActivity" :key="i" class="flex-1 flex flex-col items-center gap-3 group h-full">
        <div class="w-full relative flex flex-col justify-end flex-1 group">
          <!-- grey background track -->
          <div class="w-full h-full absolute inset-0 bg-slate-100/70 rounded-full overflow-hidden">
            <!-- blue progress bar, grows from bottom with % height -->
            <div 
              class="w-full bg-blue-600 rounded-full transition-all duration-1000 group-hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)] absolute bottom-0"
              :style="{ height: `${day.value}%` }"
            ></div>
          </div>
          <!-- hover tooltip -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
            <span class="bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md">{{ day.hours }}h</span>
          </div>
        </div>
        <span class="text-xs font-bold text-slate-400 uppercase tracking-tighter">{{ day.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();

const weekActivity = computed(() => [
  { label: t('dashboard.days.mon'), value: 45, hours: 3.2 },
  { label: t('dashboard.days.tue'), value: 30, hours: 2.1 },
  { label: t('dashboard.days.wed'), value: 65, hours: 4.5 },
  { label: t('dashboard.days.thu'), value: 20, hours: 1.5 },
  { label: t('dashboard.days.fri'), value: 85, hours: 6.0 },
  { label: t('dashboard.days.sat'), value: 40, hours: 2.8 },
  { label: t('dashboard.days.sun'), value: 15, hours: 1.0 },
]);
</script>
