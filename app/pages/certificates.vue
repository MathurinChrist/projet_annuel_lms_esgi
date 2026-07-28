<template>
  <div class="space-y-6">
    <div class="rounded-3xl bg-gradient-to-br from-[#0A66C2] to-[#004182] p-5 sm:p-7 md:p-8 text-white shadow-xl shadow-blue-200/30">
      <p class="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">{{ $t('certificates.brand') }}</p>
      <h1 class="text-2xl sm:text-3xl font-black tracking-tight mt-2">{{ $t('certificates.title') }}</h1>
      <p class="text-blue-100 text-sm mt-2 max-w-2xl">
        {{ $t('certificates.subtitle') }}
      </p>
    </div>

    <div v-if="pending" class="h-64 rounded-2xl bg-slate-100 animate-pulse" />

    <div v-else-if="error" class="bg-white border border-rose-100 rounded-2xl p-8 text-center">
      <p class="text-rose-600 text-sm font-medium">{{ error }}</p>
      <button class="mt-4 text-sm font-bold text-[#0A66C2] hover:underline" @click="load">{{ $t('common.retry') }}</button>
    </div>

    <template v-else>
      <section v-if="data.pending?.length" class="space-y-3">
        <h2 class="text-sm font-black uppercase tracking-wider text-amber-700">{{ $t('certificates.to_generate') }}</h2>
        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="item in data.pending"
            :key="item.course.id"
            class="bg-white border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <img
              v-if="item.course.coverImage"
              :src="item.course.coverImage"
              class="size-14 rounded-xl object-cover shrink-0"
              alt=""
            >
            <div class="min-w-0 flex-1">
              <p class="font-bold text-slate-800 truncate">{{ item.course.title }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ $t('certificates.ready_hint') }}</p>
            </div>
            <button
              type="button"
              class="h-11 px-5 rounded-full bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors shrink-0 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              :disabled="issuingSlug === item.course.slug"
              @click="issueAndShow(item.course.slug)"
            >
              <Loader2 v-if="issuingSlug === item.course.slug" :size="16" class="animate-spin" />
              {{ issuingSlug === item.course.slug ? $t('certificates.generating') : $t('certificates.generate') }}
            </button>
          </div>
        </div>
      </section>

      <div
        v-if="!data.certificates?.length && !data.pending?.length"
        class="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm"
      >
        <div class="size-14 rounded-2xl bg-[#E8F3FF] text-[#0A66C2] flex items-center justify-center mx-auto mb-4">
          <Award :size="26" />
        </div>
        <h3 class="font-bold text-slate-800">{{ $t('certificates.empty_title') }}</h3>
        <p class="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          {{ $t('certificates.empty_subtitle') }}
        </p>
        <NuxtLink
          :to="localePath('/catalog')"
          class="inline-flex mt-5 px-5 h-10 items-center rounded-full bg-[#0A66C2] text-white text-sm font-bold hover:bg-[#004182] transition-colors"
        >
          {{ $t('certificates.browse') }}
        </NuxtLink>
      </div>

      <template v-if="data.certificates?.length">
        <div v-if="data.certificates.length > 1" class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="c in data.certificates"
            :key="c.id"
            type="button"
            class="shrink-0 px-4 h-10 rounded-full text-xs font-bold border transition-colors"
            :class="selectedCode === c.code
              ? 'bg-[#0A66C2] text-white border-[#0A66C2]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-[#0A66C2]/40'"
            @click="selectCertificate(c.code)"
          >
            {{ c.course.title }}
          </button>
        </div>

        <section class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div class="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-[#0A66C2]">{{ $t('certificates.completion') }}</p>
              <h2 class="font-bold text-slate-900 truncate mt-1">
                {{ activeMeta?.course?.title || $t('certificates.fallback_title') }}
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ activeMeta ? formatDate(activeMeta.issuedAt) : '' }}
                <span v-if="activeMeta?.levelLabel"> · {{ activeMeta.levelLabel }}</span>
                <span v-if="activeMeta?.mention"> · {{ activeMeta.mention }}</span>
              </p>
            </div>

            <div class="flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                class="h-11 px-5 rounded-full border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                :disabled="!fullCert || downloading"
                @click="onPrint"
              >
                {{ $t('certificates.print') }}
              </button>
              <button
                type="button"
                class="h-11 px-6 rounded-full bg-[#0A66C2] text-white text-sm font-bold hover:bg-[#004182] transition-colors disabled:opacity-40 inline-flex items-center gap-2 shadow-sm"
                :disabled="!fullCert || downloading"
                @click="onDownload"
              >
                <Loader2 v-if="downloading" :size="16" class="animate-spin" />
                <Download v-else :size="16" />
                {{ downloading ? $t('certificates.preparing') : $t('certificates.download_pdf') }}
              </button>
            </div>
          </div>

          <p v-if="downloadError" class="px-5 pt-3 text-sm text-rose-600 font-medium">
            {{ downloadError }}
          </p>
          <p v-else-if="downloadOk" class="px-5 pt-3 text-sm text-[#057642] font-medium">
            {{ $t('certificates.downloaded') }}
          </p>

          <div v-if="detailLoading" class="py-20 text-center">
            <div class="size-10 mx-auto rounded-full border-4 border-slate-200 border-t-[#0A66C2] animate-spin" />
            <p class="text-sm text-slate-400 mt-3">{{ $t('certificates.loading_preview') }}</p>
          </div>

          <div v-else-if="detailError" class="py-12 text-center text-rose-600 text-sm">
            {{ detailError }}
          </div>

          <div v-else-if="fullCert" class="p-4 md:p-6 bg-[#EDF3F8]">
            <div class="mx-auto overflow-x-auto">
              <div
                class="mx-auto overflow-hidden rounded-lg shadow-[0_16px_48px_rgba(10,102,194,0.12)] border border-slate-200 bg-white"
                :style="previewFrameStyle"
              >
                <div :style="previewInnerStyle">
                  <CertificateDocument :data="fullCert" />
                </div>
              </div>
            </div>
            <p class="mt-4 text-center text-[11px] font-mono text-slate-400">ID {{ fullCert.code }}</p>
          </div>
        </section>

        <div class="hidden print:block">
          <CertificateDocument v-if="fullCert" :data="fullCert" />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { Award, Download, Loader2 } from 'lucide-vue-next'
import { downloadCertificatePdfFile } from '~/utils/certificateDownload'

const route = useRoute()
const localePath = useLocalePath()
const { t, locale } = useI18n()
const student = useStudentCourse()
const token = useCookie('token')

const pending = ref(true)
const error = ref('')
const data = ref({ certificates: [], pending: [] })
const issuingSlug = ref('')

const selectedCode = ref('')
const fullCert = ref(null)
const detailLoading = ref(false)
const detailError = ref('')
const downloading = ref(false)
const downloadError = ref('')
const downloadOk = ref(false)
const previewScale = ref(1)

const activeMeta = computed(() =>
  data.value.certificates?.find(c => c.code === selectedCode.value) || null,
)

const previewFrameStyle = computed(() => ({
  width: `${Math.round(1123 * previewScale.value)}px`,
  height: `${Math.round(794 * previewScale.value)}px`,
}))

const previewInnerStyle = computed(() => ({
  width: '1123px',
  height: '794px',
  transform: `scale(${previewScale.value})`,
  transformOrigin: 'top left',
}))

const dateLocale = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-US'))

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(dateLocale.value, { day: 'numeric', month: 'long', year: 'numeric' })
}

function updatePreviewScale() {
  if (!import.meta.client) return
  const maxW = Math.min(window.innerWidth - 96, 1123)
  previewScale.value = Math.min(1, Math.max(0.35, maxW / 1123))
}

async function load() {
  pending.value = true
  error.value = ''
  try {
    data.value = await student.getCertificates()
    const fromQuery = String(route.query.code || '')
    const first = data.value.certificates?.[0]?.code
    const preferred = data.value.certificates?.some(c => c.code === fromQuery)
      ? fromQuery
      : first
    if (preferred) {
      await selectCertificate(preferred)
    } else {
      selectedCode.value = ''
      fullCert.value = null
    }
  } catch (e) {
    error.value = e?.data?.message || e?.data?.statusMessage || e?.message || t('certificates.list_error')
  } finally {
    pending.value = false
  }
}

async function selectCertificate(code) {
  if (!code) return
  selectedCode.value = code
  detailLoading.value = true
  detailError.value = ''
  downloadError.value = ''
  downloadOk.value = false
  try {
    const detail = await student.getCertificateByCode(code)
    const fromList = data.value.certificates?.find(c => c.code === code)
    fullCert.value = {
      ...detail,
      durationMinutes: detail.durationMinutes ?? fromList?.durationMinutes ?? detail.course?.durationMinutes,
      durationLabel: (detail.durationLabel && detail.durationLabel !== '—')
        ? detail.durationLabel
        : (fromList?.durationLabel || detail.course?.durationLabel || fromList?.course?.durationLabel || ''),
      course: {
        ...detail.course,
        durationMinutes: detail.course?.durationMinutes ?? fromList?.durationMinutes ?? fromList?.course?.durationMinutes,
        durationLabel: (detail.course?.durationLabel && detail.course.durationLabel !== '—')
          ? detail.course.durationLabel
          : (fromList?.durationLabel || fromList?.course?.durationLabel || ''),
      },
    }
  } catch (e) {
    fullCert.value = null
    detailError.value = e?.data?.message || e?.data?.statusMessage || e?.message || t('certificates.load_error')
  } finally {
    detailLoading.value = false
  }
}

async function issueAndShow(slug) {
  issuingSlug.value = slug
  error.value = ''
  try {
    const cert = await student.issueCertificate(slug)
    data.value = await student.getCertificates()
    if (cert?.code) await selectCertificate(cert.code)
  } catch (e) {
    error.value = e?.data?.message || e?.data?.statusMessage || e?.message || t('certificates.issue_error')
  } finally {
    issuingSlug.value = ''
  }
}

function onPrint() {
  window.print()
}

async function onDownload() {
  if (!fullCert.value?.code || downloading.value) return
  downloading.value = true
  downloadError.value = ''
  downloadOk.value = false
  try {
    const err = await downloadCertificatePdfFile(fullCert.value.code, token.value)
    if (err) downloadError.value = err
    else downloadOk.value = true
  } catch (e) {
    downloadError.value = e?.message || t('certificates.download_error')
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  updatePreviewScale()
  window.addEventListener('resize', updatePreviewScale)
  load()
})

onUnmounted(() => {
  if (import.meta.client) window.removeEventListener('resize', updatePreviewScale)
})
</script>

<style>
@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }
  html, body {
    background: white !important;
  }
}
</style>
