<template>
  <div class="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
    <div class="flex items-center justify-between mb-8">
      <h3 class="text-lg font-bold text-slate-900">{{ $t('dashboard.learning_activity') }}</h3>
    </div>
    <div class="flex items-end justify-between h-48 px-2" :class="chartData.length > 7 ? 'gap-1' : 'gap-4'">
      <div v-for="(day, i) in chartData" :key="i" class="flex-1 flex flex-col items-center gap-3 group h-full">
        <div class="w-full relative flex flex-col justify-end flex-1 group">
          <div class="w-full h-full absolute inset-0 bg-slate-100/70 rounded-full overflow-hidden">
            <div
              class="w-full bg-blue-600 rounded-full transition-all duration-1000 group-hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)] absolute bottom-0"
              :style="{ height: `${day.value}%` }"
            ></div>
          </div>
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
            <span class="bg-slate-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">{{ day.tooltip }}</span>
          </div>
        </div>
        <span v-if="chartData.length <= 7" class="text-sm font-bold text-slate-500 uppercase tracking-normal">{{ day.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();

const props = defineProps({
  activity: { type: Array, default: () => [] },
});

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const maxMinutes = computed(() => Math.max(1, ...props.activity.map(d => d.minutes)));

const chartData = computed(() => {
  const isLongRange = props.activity.length > 7;
  return props.activity.map(d => {
    const hours = Math.round((d.minutes / 60) * 10) / 10;
    const dayLabel = t(`dashboard.days.${dayKeys[d.dayIndex]}`);
    return {
      label: dayLabel,
      value: Math.round((d.minutes / maxMinutes.value) * 100),
      hours,
      tooltip: isLongRange ? `${dayLabel} ${d.dayOfMonth} · ${hours}h` : `${hours}h`,
    };
  });
});
</script>
