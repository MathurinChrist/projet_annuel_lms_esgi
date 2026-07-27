<template>
  <div
    ref="rootEl"
    class="certificate-li relative bg-white text-[#191919] overflow-hidden select-none"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <div class="absolute top-0 inset-x-0 h-[6px] bg-[#0A66C2]" />

    <div class="absolute inset-y-0 right-0 w-[36%] bg-[#F4F2EE]" />
    <div
      class="absolute inset-y-0 right-0 w-[36%] opacity-[0.07] pointer-events-none"
      style="background-image: radial-gradient(circle at 30% 20%, #0A66C2 1.5px, transparent 1.6px); background-size: 22px 22px;"
    />
    <div class="absolute top-0 bottom-0 right-[36%] w-px bg-[#D9D3C9]" />

    <div class="relative z-10 h-full flex">
      <div class="w-[64%] h-full pl-14 pr-12 py-12 flex flex-col">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-lg bg-[#0A66C2] flex items-center justify-center shrink-0 shadow-sm text-white">
            <GraduationCap :size="22" :stroke-width="2.25" />
          </div>
          <div>
            <p class="text-[15px] font-semibold text-[#191919] leading-none">{{ $t('certificates.brand') }}</p>
            <p class="text-[11px] text-[#666] mt-1">{{ $t('certificates.completion') }}</p>
          </div>
        </div>

        <p class="text-[15px] text-[#666] mt-10">
          {{ $t('certificates.document.congratulations', { name: data.learner?.fullName }) }}
        </p>

        <h1 class="text-[34px] font-bold leading-[1.15] text-[#191919] mt-5 max-w-[560px]">
          {{ data.course?.title }}
        </h1>

        <p class="text-[14px] text-[#666] mt-6 leading-relaxed max-w-[520px]">
          {{ $t('certificates.document.awarded') }}
          <template v-if="data.course?.category">
            · <span class="text-[#191919] font-medium">{{ data.course.category }}</span>
          </template>
          · {{ issuedLabel }}
        </p>

        <div class="mt-5 flex flex-wrap gap-2">
          <span class="inline-flex items-center px-3 h-7 rounded-full bg-[#E8F3FF] text-[#0A66C2] text-[11px] font-bold">
            {{ data.levelLabel }}
          </span>
          <span
            v-if="data.mention"
            class="inline-flex items-center px-3 h-7 rounded-full bg-[#E8F3EC] text-[#057642] text-[11px] font-bold"
          >
            {{ data.mention }}
          </span>
          <span
            v-if="data.scorePercent != null"
            class="inline-flex items-center px-3 h-7 rounded-full border border-[#D9D3C9] text-[#666] text-[11px] font-semibold"
          >
            {{ $t('learn.quiz.score', { score: data.scorePercent }) }}
          </span>
          <span
            v-if="durationLabel"
            class="inline-flex items-center px-3 h-7 rounded-full border border-[#D9D3C9] text-[#666] text-[11px] font-semibold"
          >
            {{ durationLabel }}
          </span>
        </div>

        <div class="mt-auto pt-8 flex items-end gap-10">
          <div class="min-w-[160px] rounded-xl border border-[#0A66C2]/25 bg-[#F8FBFE] px-4 py-3">
            <p class="text-[10px] font-bold tracking-[0.14em] uppercase text-[#0A66C2]">
              {{ $t('certificates.document.duration_label') }}
            </p>
            <p class="text-[22px] font-bold text-[#191919] mt-1 leading-none">
              {{ durationLabel || '—' }}
            </p>
          </div>

          <div>
            <p
              class="text-[20px] leading-none mb-2 italic text-[#0A66C2]"
              style="font-family: Georgia, 'Times New Roman', serif"
            >
              {{ data.course?.author?.fullName }}
            </p>
            <div class="w-40 h-px bg-[#Cfc9be] mb-2" />
            <p class="text-[12px] font-semibold text-[#191919]">{{ $t('certificates.document.instructor_role') }}</p>
            <p class="text-[11px] text-[#666] mt-0.5">{{ data.platform?.name }}</p>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="w-[36%] h-full pl-10 pr-10 py-12 flex flex-col">
        <p class="text-[22px] font-bold text-[#0A66C2] tracking-tight leading-none">
          {{ data.platform?.name }}
        </p>
        <p class="text-[12px] text-[#666] mt-3 leading-snug">
          {{ data.platform?.tagline }}
        </p>
        <p class="text-[12px] font-semibold text-[#191919] mt-6">
          {{ data.platform?.institution }}
        </p>
        <p class="text-[11px] text-[#666] mt-1">
          {{ $t('certificates.document.year', { year: data.platform?.academicYear }) }}
        </p>

        <div class="mt-8 border border-[#0A66C2]/30 bg-white/80 px-4 py-4">
          <p class="text-[10px] font-bold tracking-[0.14em] uppercase text-[#0A66C2]">
            {{ $t('certificates.completion') }}
          </p>
          <p class="text-[17px] font-bold text-[#191919] mt-1.5">{{ data.levelLabel }}</p>
          <p v-if="data.mention" class="text-[12px] text-[#057642] font-semibold mt-1">
            {{ data.mention }}
          </p>
          <p v-if="durationLabel" class="text-[12px] text-[#666] mt-2">
            <span class="font-semibold text-[#191919]">{{ durationLabel }}</span>
          </p>
        </div>

        <div class="mt-8 flex-1 flex items-center justify-center">
          <div class="relative size-[168px] shrink-0">
            <div class="absolute inset-0 rounded-full border-[3px] border-[#0A66C2]/90" />
            <div class="absolute inset-[8px] rounded-full border border-dashed border-[#0A66C2]/55" />
            <div class="absolute inset-[16px] rounded-full bg-[#0A66C2] flex flex-col items-center justify-center text-center px-4 shadow-[inset_0_0_24px_rgba(0,0,0,0.15)]">
              <p class="text-[9px] font-bold tracking-[0.28em] uppercase text-blue-100">ESGI</p>
              <p class="text-[17px] font-black text-white leading-none mt-1.5 tracking-tight">EduPulse</p>
              <div class="w-9 h-px bg-white/45 my-2.5" />
              <p class="text-[8px] font-bold tracking-[0.2em] uppercase text-blue-100">{{ $t('certificates.document.seal') }}</p>
              <p class="text-[9px] font-semibold text-white/95 mt-1">{{ data.platform?.academicYear }}</p>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-[#D9D3C9]">
          <p class="text-[10px] font-bold tracking-[0.12em] uppercase text-[#057642]">
            ID
          </p>
          <p class="text-[11px] font-mono text-[#191919] mt-1.5 break-all leading-snug">
            {{ data.code }}
          </p>
          <p class="text-[10px] text-[#666] mt-2 leading-snug">
            {{ $t('certificates.document.verify') }}
          </p>
        </div>
      </div>
    </div>

    <div class="absolute bottom-0 inset-x-0 h-[6px] bg-[#0A66C2]" />
  </div>
</template>

<script setup>
import { GraduationCap } from 'lucide-vue-next'

const WIDTH = 1123
const HEIGHT = 794

const props = defineProps({
  data: { type: Object, required: true },
})

const { locale } = useI18n()
const dateLocale = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-US'))

const rootEl = ref(null)
const width = WIDTH
const height = HEIGHT

const issuedLabel = computed(() => {
  const d = props.data?.issuedAt ? new Date(props.data.issuedAt) : new Date()
  return d.toLocaleDateString(dateLocale.value, { month: 'long', day: 'numeric', year: 'numeric' })
})

const durationLabel = computed(() => {
  const raw =
    props.data?.durationLabel
    || props.data?.course?.durationLabel
    || ''
  if (raw && raw !== '—') return raw
  const mins = Number(props.data?.durationMinutes ?? props.data?.course?.durationMinutes ?? 0)
  if (!mins) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h} h ${m} min`
  if (h > 0) return `${h} h`
  return `${m} min`
})

defineExpose({ rootEl, width, height })
</script>
