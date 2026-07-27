<template>
  <div>
    <div class="flex items-start justify-between mb-2">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">{{ $t('nav.dashboard') }}</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <NuxtLink :to="localePath('/courses')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">{{ $t('instructor.courses_title') }}</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">{{ $t('instructor.settings') }}</span>
        </nav>
        <h1 class="text-2xl font-black tracking-tight text-slate-900">{{ $t('instructor.settings') }}</h1>
        <div class="flex items-center gap-3 mt-1">
          <p class="text-slate-400 text-sm">{{ course?.title }}</p>
          <span class="size-1 bg-slate-300 rounded-full" />
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
            :class="course?.status === 'PUBLISHED'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'"
          >
            {{ course?.status === 'PUBLISHED' ? $t('common.published') : $t('instructor.ready_to_publish') }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-3 mt-1 shrink-0">
        <NuxtLink
          v-if="course?.status === 'PUBLISHED'"
          :to="localePath(`/instructor/courses/${slug}/feedback`)"
          class="flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <MessageCircle :size="15" />
          Avis &amp; Questions
        </NuxtLink>
        <button
          v-if="course?.status === 'PUBLISHED'"
          class="flex items-center gap-2 px-5 h-10 rounded-lg bg-primary text-white text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-60"
          :disabled="saving || loading"
          @click="handleSave"
        >
          <Save :size="15" />
          {{ saving ? $t('common.saving') : $t('common.save_changes') }}
        </button>
        <button
          v-else
          class="flex items-center gap-2 px-5 h-10 rounded-lg bg-primary text-white text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-60"
          :disabled="publishing || loading"
          @click="handlePublish"
        >
          <Rocket :size="15" />
          {{ publishing ? $t('common.publishing') : $t('common.publish_course') }}
        </button>
      </div>
    </div>

    <InstructorCourseCreationStepper :current-step="4" :steps="COURSE_STEPS" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <div class="lg:col-span-2 space-y-6">

        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 class="text-base font-bold mb-5 flex items-center gap-2">
            <Eye :size="18" class="text-primary" />
            Accès &amp; Visibilité
          </h3>
          <div class="space-y-4">

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-bold text-sm">Cours public</p>
                <p class="text-xs text-slate-400 mt-0.5">N'importe qui peut trouver et s'inscrire à ce cours.</p>
              </div>
              <div v-if="loading" class="h-6 w-11 rounded-full bg-slate-200 animate-pulse" />
              <button
                v-else
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                :class="settings.isPublic ? 'bg-primary' : 'bg-slate-200'"
                @click="settings.isPublic = !settings.isPublic"
              >
                <span
                  class="pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5"
                  :class="settings.isPublic ? 'translate-x-5' : 'translate-x-0.5'"
                />
              </button>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-bold text-sm">{{ $t('instructor.certificate_toggle') }}</p>
                <p class="text-xs text-slate-400 mt-0.5">Délivrer un certificat de complétion aux apprenants.</p>
              </div>
              <div v-if="loading" class="h-6 w-11 rounded-full bg-slate-200 animate-pulse" />
              <button
                v-else
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                :class="settings.hasCertificate ? 'bg-primary' : 'bg-slate-200'"
                @click="settings.hasCertificate = !settings.hasCertificate"
              >
                <span
                  class="pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5"
                  :class="settings.hasCertificate ? 'translate-x-5' : 'translate-x-0.5'"
                />
              </button>
            </div>

          </div>
        </div>

      </div>

      <div class="space-y-6">

        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div class="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
              v-if="course?.coverImage"
              :src="course.coverImage"
              :alt="course.title"
              class="w-full h-full object-cover"
            />
            <ImageIcon v-else :size="32" class="text-slate-300" />
          </div>
          <div class="p-5 space-y-4">
            <div>
              <p class="font-bold text-sm">{{ course?.title }}</p>
              <div class="flex items-center gap-1.5 mt-1">
                <Clock :size="12" class="text-slate-400" />
                <p class="text-[10px] text-slate-400 font-bold uppercase">{{ totalDuration }}</p>
              </div>
            </div>
            <div class="border-t border-slate-100 pt-3 space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">Modules</span>
                <span class="font-bold">{{ course?.modules?.length ?? 0 }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">Leçons</span>
                <span class="font-bold">{{ totalLessons }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <template v-if="course?.status === 'PUBLISHED'">
            <button
              class="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              :disabled="saving || loading"
              @click="handleSave"
            >
              <Save :size="16" />
              {{ saving ? $t('common.saving') : $t('common.save_changes') }}
            </button>
          </template>
          <!-- Cours brouillon : publier + sauvegarder -->
          <template v-else>
            <button
              class="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              :disabled="publishing || loading"
              @click="handlePublish"
            >
              <Rocket :size="16" />
              {{ publishing ? $t('common.publishing') : $t('common.publish_course') }}
            </button>
            <button
              class="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              :disabled="saving || loading"
              @click="handleSave"
            >
              <Save :size="16" />
              {{ saving ? $t('common.saving') : $t('common.save_draft') }}
            </button>
            <p class="text-[10px] text-center text-slate-400 px-2">
              En publiant, vous acceptez nos conditions d'utilisation pour les formateurs.
            </p>
            <button
              class="w-full py-3 bg-white border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              @click="handleAbandonDraft"
            >
              <Trash2 :size="16" />
              {{ $t('instructor.discard_draft') }}
            </button>
          </template>
        </div>

        <!-- Aide -->
        <div class="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
          <Info :size="16" class="text-primary mt-0.5 shrink-0" />
          <div>
            <p class="text-xs font-bold text-primary mb-1">Besoin d'aide ?</p>
            <p class="text-[10px] text-slate-400">Contactez notre équipe de support formateur pour une revue finale de votre contenu.</p>
          </div>
        </div>

      </div>
    </div>

    <!-- Navigation bas de page -->
    <div class="mt-10 flex justify-between items-center pt-6 border-t border-slate-200">
      <NuxtLink
        :to="localePath(`/instructor/courses/${slug}/curriculum`)"
        class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors"
      >
        <ChevronLeft :size="14" />
        Étape précédente
      </NuxtLink>

      <UiSaveStatus :is-dirty="isDirty" :error="error" />
    </div>
  </div>
</template>

<script setup>
import {
  ChevronLeft,
  Eye,
  Rocket,
  Save,
  Trash2,
  Clock,
  Info,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-vue-next'
import { COURSE_STEPS } from '~/utils/courseSteps'
import { parseDurationMinutes, formatDuration } from '~/utils/duration'

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const creation = useCourseCreation()

const slug = route.params.slug

const course = ref(null)
const courseId = ref(null)
const loading = ref(true)
const publishing = ref(false)
const saving = ref(false)
const error = ref('')
const { isDirty, markDirty, markSaved } = useSaveStatus()

const settings = reactive({
  isPublic: true,
  hasCertificate: true,
})

onMounted(async () => {
  try {
    const data = await creation.getCourse(slug)
    course.value = data
    courseId.value = data.id
    settings.isPublic = data.isPublic
    settings.hasCertificate = data.hasCertificate
  } catch {
    navigateTo(localePath('/instructor/courses/create'))
    return
  } finally {
    loading.value = false
  }
  watch(settings, markDirty, { deep: true })
})

const totalLessons = computed(() =>
  course.value?.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0
)

const totalDuration = computed(() => {
  const all = course.value?.modules?.flatMap(m => m.lessons ?? []) ?? []
  const mins = all.reduce((sum, l) => sum + parseDurationMinutes(l.duration), 0)
  return formatDuration(mins)
})

async function handleSave() {
  error.value = ''
  saving.value = true
  try {
    await creation.saveSettings(courseId.value, {
      isPublic: settings.isPublic,
      hasCertificate: settings.hasCertificate,
    })
    markSaved()
  } catch {
    error.value = t('instructor.save_error')
  } finally {
    saving.value = false
  }
}

async function handleAbandonDraft() {
  if (!confirm(t('common.confirm_delete_draft'))) return
  try {
    await creation.deleteCourse(courseId.value)
    navigateTo(localePath('/courses'))
  } catch {
    error.value = 'Erreur lors de la suppression du brouillon.'
  }
}

async function handlePublish() {
  error.value = ''
  publishing.value = true
  try {
    await creation.publishCourse(courseId.value, {
      isPublic: settings.isPublic,
      hasCertificate: settings.hasCertificate,
    })
    navigateTo(localePath(`/instructor/courses/${slug}/published`))
  } catch {
    error.value = 'Erreur lors de la publication.'
  } finally {
    publishing.value = false
  }
}
</script>
