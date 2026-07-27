<template>
  <div v-if="pending" class="space-y-6 animate-pulse">
    <div class="h-8 bg-slate-200 rounded-lg w-1/3" />
    <div class="flex gap-10">
      <div class="flex-1 space-y-4">
        <div class="h-10 bg-slate-200 rounded-lg w-3/4" />
        <div class="h-64 bg-slate-200 rounded-2xl" />
      </div>
      <div class="w-[340px] h-80 bg-slate-200 rounded-2xl shrink-0" />
    </div>
  </div>

  <div v-else-if="!course" class="flex flex-col items-center justify-center py-24 text-center">
    <BookOpen :size="40" class="text-slate-300 mb-4" />
    <h2 class="font-bold text-slate-700 mb-1">Cours introuvable</h2>
    <NuxtLink :to="localePath('/catalog')" class="mt-4 text-sm font-bold text-primary hover:underline">← Retour au catalogue</NuxtLink>
  </div>

  <div v-else>
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 mb-6 text-sm text-slate-400 font-medium">
      <NuxtLink :to="localePath('/')" class="hover:text-primary transition-colors">Tableau de bord</NuxtLink>
      <ChevronRight :size="14" />
      <NuxtLink :to="localePath('/catalog')" class="hover:text-primary transition-colors">Catalogue</NuxtLink>
      <ChevronRight :size="14" />
      <span v-if="course.category" class="hover:text-primary transition-colors">{{ course.category.name }}</span>
      <ChevronRight v-if="course.category" :size="14" />
      <span class="text-slate-700 font-semibold truncate max-w-xs">{{ course.title }}</span>
    </nav>

    <div class="flex flex-col lg:flex-row gap-10">
      <!-- ── Left column ─────────────────────────────────────── -->
      <div class="flex-1 min-w-0">
        <!-- Title & meta -->
        <div class="mb-8">
          <div class="flex flex-wrap gap-2 mb-3">
            <span v-if="course.category" class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {{ course.category.name }}
            </span>
            <span class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full" :class="difficultyClass">
              {{ difficultyLabel }}
            </span>
          </div>

          <h1 class="text-3xl font-black tracking-tight text-slate-900 mb-4 leading-tight">{{ course.title }}</h1>

          <div class="flex flex-wrap items-center gap-5 text-sm text-slate-500">
            <div v-if="course.reviewCount" class="flex items-center gap-1.5">
              <Star :size="16" class="fill-amber-400 text-amber-400" />
              <span class="font-bold text-slate-800">{{ course.rating.toFixed(1) }}</span>
              <span>({{ course.reviewCount }} avis)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Users :size="16" />
              <span>{{ course.enrollmentCount }} inscrits</span>
            </div>
            <div v-if="course.durationMinutes" class="flex items-center gap-1.5">
              <Clock :size="16" />
              <span>{{ formatDuration(course.durationMinutes) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <BookOpen :size="16" />
              <span>{{ course.lessonCount }} leçons</span>
            </div>
            <div v-if="course.hasCertificate" class="flex items-center gap-1.5">
              <Award :size="16" />
              <span>Certificat inclus</span>
            </div>
          </div>
        </div>

        <!-- Cover image -->
        <div class="relative rounded-2xl overflow-hidden mb-8 aspect-video bg-slate-900 flex items-center justify-center">
          <img
            v-if="course.coverImage"
            :src="course.coverImage"
            :alt="course.title"
            class="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center" :class="coverGradient">
            <BookOpen :size="48" class="text-white/60" />
          </div>
          <div v-if="course.author" class="absolute bottom-4 left-4 z-10">
            <span class="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Par {{ authorName }}
            </span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-slate-200 flex gap-1 mb-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="pb-3 px-4 text-sm font-bold transition-colors relative"
            :class="activeTab === tab.id
              ? 'text-primary'
              : 'text-slate-500 hover:text-slate-800'"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
            <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          </button>
        </div>

        <!-- Tab: Overview -->
        <section v-if="activeTab === 'overview'" class="space-y-8">
          <div v-if="course.description">
            <h2 class="text-lg font-bold text-slate-900 mb-3">Description du cours</h2>
            <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ stripHtml(course.description) }}</div>
          </div>

          <div v-if="course.tags?.length">
            <h2 class="text-lg font-bold text-slate-900 mb-4">Ce que vous apprendrez</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="tag in course.tags"
                :key="tag"
                class="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <CheckCircle2 :size="18" class="text-primary mt-0.5 shrink-0" />
                <span class="text-sm text-slate-700 font-medium">{{ tag }}</span>
              </div>
            </div>
          </div>

          <!-- Author card -->
          <div v-if="course.author" class="border border-slate-200 rounded-2xl p-6 bg-white">
            <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Formateur</h2>
            <div class="flex items-center gap-4 mb-4">
              <img
                v-if="course.author.avatar"
                :src="course.author.avatar"
                :alt="authorName"
                class="size-14 rounded-full object-cover border border-slate-200"
              />
              <div v-else class="size-14 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                {{ authorInitial }}
              </div>
              <div>
                <h3 class="font-bold text-slate-900">{{ authorName }}</h3>
                <p class="text-sm text-slate-400">Formateur EduPulse</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Tab: Curriculum -->
        <section v-else-if="activeTab === 'curriculum'" class="space-y-3">
          <p class="text-sm text-slate-500 mb-4">
            {{ course.modules.length }} modules · {{ course.lessonCount }} leçons
            <span v-if="course.durationMinutes"> · {{ formatDuration(course.durationMinutes) }} au total</span>
          </p>

          <div
            v-for="mod in course.modules"
            :key="mod.id"
            class="border border-slate-200 rounded-xl overflow-hidden bg-white"
          >
            <button
              class="w-full p-4 bg-slate-50 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
              @click="toggleModule(mod.id)"
            >
              <div class="flex items-center gap-3">
                <ChevronDown
                  :size="18"
                  class="text-slate-400 transition-transform shrink-0"
                  :class="openModules.has(mod.id) ? 'rotate-0' : '-rotate-90'"
                />
                <span class="font-bold text-sm text-slate-800">{{ mod.title }}</span>
              </div>
              <span class="text-xs text-slate-400 shrink-0 ml-4">
                {{ mod.lessonCount }} leçon{{ mod.lessonCount > 1 ? 's' : '' }}
                <span v-if="mod.durationMinutes"> · {{ formatDuration(mod.durationMinutes) }}</span>
              </span>
            </button>

            <div v-if="openModules.has(mod.id)" class="divide-y divide-slate-100">
              <div
                v-for="lesson in mod.lessons"
                :key="lesson.id"
                class="px-5 py-3 flex items-center gap-4 text-sm"
                :class="course.enrolled ? 'text-slate-700' : 'text-slate-400'"
              >
                <component :is="lessonIcon(lesson.type)" :size="16" class="shrink-0" :class="course.enrolled ? 'text-primary' : 'text-slate-300'" />
                <span class="flex-1 truncate">{{ lesson.title }}</span>
                <span v-if="lesson.duration" class="text-xs text-slate-400 shrink-0">{{ lesson.duration }}</span>
                <Lock v-if="!course.enrolled" :size="13" class="text-slate-300 shrink-0" />
              </div>
            </div>
          </div>
        </section>

        <!-- Tab: Reviews -->
        <section v-else-if="activeTab === 'reviews'" class="space-y-6">
          <div v-if="course.reviewCount" class="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div class="text-center">
              <div class="text-5xl font-black text-slate-900">{{ course.rating.toFixed(1) }}</div>
              <div class="flex items-center gap-0.5 mt-1 justify-center">
                <Star
                  v-for="i in 5"
                  :key="i"
                  :size="14"
                  :class="i <= Math.round(course.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'"
                />
              </div>
              <div class="text-xs text-slate-400 mt-1">{{ course.reviewCount }} avis</div>
            </div>
          </div>

          <div v-if="course.recentReviews?.length" class="space-y-4">
            <div
              v-for="review in course.recentReviews"
              :key="review.id"
              class="p-5 bg-white border border-slate-100 rounded-2xl"
            >
              <div class="flex items-center gap-3 mb-3">
                <div class="size-9 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {{ reviewerInitial(review.user) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-sm text-slate-800">{{ reviewerName(review.user) }}</p>
                  <div class="flex items-center gap-0.5 mt-0.5">
                    <Star
                      v-for="i in 5"
                      :key="i"
                      :size="12"
                      :class="i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'"
                    />
                  </div>
                </div>
                <span class="text-xs text-slate-400 shrink-0">{{ formatDate(review.createdAt) }}</span>
              </div>
              <p v-if="review.comment" class="text-sm text-slate-600 leading-relaxed">{{ review.comment }}</p>
            </div>
          </div>

          <div v-else class="py-12 text-center text-slate-400 text-sm">
            Aucun avis pour ce cours.
          </div>
        </section>
      </div>

      <!-- ── Right sidebar ───────────────────────────────────── -->
      <aside class="w-full lg:w-[340px] shrink-0">
        <div class="sticky top-24 space-y-4">
          <!-- Enroll card -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg shadow-slate-100">
            <!-- Enrolled state -->
            <template v-if="course.enrolled">
              <div class="mb-5">
                <div class="flex justify-between text-xs font-bold mb-2">
                  <span class="text-primary">Progression</span>
                  <span class="text-slate-500">{{ course.progress }}%</span>
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-primary rounded-full transition-all" :style="{ width: `${course.progress}%` }" />
                </div>
              </div>

              <NuxtLink
                :to="localePath(`/learn/${course.slug}`)"
                class="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-primary/20"
              >
                <PlayCircle :size="18" />
                {{ course.progress > 0 ? 'Continuer le cours' : 'Commencer le cours' }}
              </NuxtLink>

              <p class="text-center text-xs text-emerald-600 font-bold mt-3 flex items-center justify-center gap-1.5">
                <CheckCircle2 :size="14" />
                Vous êtes inscrit à ce cours
              </p>
            </template>

            <!-- Not enrolled state -->
            <template v-else>
              <button
                :disabled="enrolling"
                class="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary/20 mb-3"
                @click="enroll"
              >
                <Loader2 v-if="enrolling" :size="18" class="animate-spin" />
                <GraduationCap v-else :size="18" />
                {{ enrolling ? 'Inscription...' : "S'inscrire" }}
              </button>

              <p v-if="enrollError" class="text-xs text-red-500 text-center mb-2">{{ enrollError }}</p>
            </template>

            <!-- Course includes -->
            <div class="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Ce cours comprend</p>
              <div class="flex items-center gap-3 text-sm text-slate-600">
                <BookOpen :size="16" class="text-slate-400 shrink-0" />
                <span>{{ course.lessonCount }} leçons</span>
              </div>
              <div v-if="course.durationMinutes" class="flex items-center gap-3 text-sm text-slate-600">
                <Clock :size="16" class="text-slate-400 shrink-0" />
                <span>{{ formatDuration(course.durationMinutes) }} de contenu</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-slate-600">
                <Infinity :size="16" class="text-slate-400 shrink-0" />
                <span>Accès à vie</span>
              </div>
              <div v-if="course.hasCertificate" class="flex items-center gap-3 text-sm text-slate-600">
                <Award :size="16" class="text-slate-400 shrink-0" />
                <span>Certificat de réussite</span>
              </div>
              <div v-if="course.modules.length" class="flex items-center gap-3 text-sm text-slate-600">
                <Layers :size="16" class="text-slate-400 shrink-0" />
                <span>{{ course.modules.length }} modules</span>
              </div>
            </div>

            <!-- Certificate badge -->
            <div v-if="course.hasCertificate" class="mt-5 p-4 bg-primary/5 rounded-xl flex items-center gap-3">
              <Award :size="28" class="text-primary shrink-0" />
              <div>
                <p class="text-xs font-bold text-primary">Certificat de complétion</p>
                <p class="text-[11px] text-slate-500 leading-tight mt-0.5">Obtenez un certificat reconnu à la fin du cours.</p>
              </div>
            </div>
          </div>

          <!-- Author mini card -->
          <div v-if="course.author" class="bg-white rounded-2xl border border-slate-200 p-5">
            <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-4">Formateur</p>
            <div class="flex items-center gap-3 mb-4">
              <img
                v-if="course.author.avatar"
                :src="course.author.avatar"
                :alt="authorName"
                class="size-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div v-else class="size-12 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {{ authorInitial }}
              </div>
              <div>
                <p class="font-bold text-sm text-slate-800">{{ authorName }}</p>
                <p class="text-xs text-slate-400">Formateur EduPulse</p>
              </div>
            </div>
            <button
              :disabled="contactingInstructor"
              class="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-primary hover:text-primary disabled:opacity-50 transition-colors"
              @click="contactInstructor"
            >
              <Loader2 v-if="contactingInstructor" :size="15" class="animate-spin" />
              <MessageCircle v-else :size="15" />
              {{ contactingInstructor ? 'Ouverture...' : 'Contacter le formateur' }}
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import {
  ChevronRight, ChevronDown, BookOpen, Star, Users, Clock, Award,
  CheckCircle2, Lock, PlayCircle, GraduationCap, Loader2,
  Infinity, Layers, Play, FileText, HelpCircle, File, MessageCircle,
} from 'lucide-vue-next'
import { formatDuration } from '~/utils/duration'

const route = useRoute()
const localePath = useLocalePath()
const token = useCookie('token')

const slug = route.params.slug

const course = ref(null)
const pending = ref(true)
const activeTab = ref('overview')
const openModules = ref(new Set())
const enrolling = ref(false)
const enrollError = ref('')
const contactingInstructor = ref(false)

const tabs = [
  { id: 'overview', label: 'Vue d\'ensemble' },
  { id: 'curriculum', label: 'Programme' },
  { id: 'reviews', label: 'Avis' },
]

function authHeaders() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}

onMounted(async () => {
  try {
    course.value = await $fetch(`/api/courses/${slug}`, { headers: authHeaders() })
    if (course.value?.modules?.length) {
      openModules.value = new Set([course.value.modules[0].id])
    }
  } catch {
    course.value = null
  } finally {
    pending.value = false
  }
})

async function enroll() {
  enrolling.value = true
  enrollError.value = ''
  try {
    await $fetch(`/api/courses/${slug}/enroll`, { method: 'POST', headers: authHeaders() })
    course.value.enrolled = true
    course.value.progress = 0
    course.value.enrollmentCount++
  } catch (e) {
    enrollError.value = e?.data?.statusMessage || 'Une erreur est survenue.'
  } finally {
    enrolling.value = false
  }
}

async function contactInstructor() {
  if (!course.value?.author?.id) return
  contactingInstructor.value = true
  try {
    const conv = await $fetch('/api/messages', {
      method: 'POST',
      headers: authHeaders(),
      body: { userId: course.value.author.id },
    })
    await navigateTo(localePath(`/messages?conv=${conv.id}`))
  } catch {
    await navigateTo(localePath('/messages'))
  } finally {
    contactingInstructor.value = false
  }
}

function toggleModule(id) {
  const s = new Set(openModules.value)
  s.has(id) ? s.delete(id) : s.add(id)
  openModules.value = s
}

function lessonIcon(type) {
  if (type === 'VIDEO') return Play
  if (type === 'QUIZ') return HelpCircle
  if (type === 'PDF') return File
  return FileText
}

function stripHtml(html) {
  return html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? ''
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function reviewerName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Anonyme'
}

function reviewerInitial(user) {
  return (user?.firstName?.[0] ?? user?.lastName?.[0] ?? '?').toUpperCase()
}

const authorName = computed(() => {
  const a = course.value?.author
  return a ? [a.firstName, a.lastName].filter(Boolean).join(' ') : ''
})

const authorInitial = computed(() => {
  const a = course.value?.author
  return (a?.firstName?.[0] ?? a?.lastName?.[0] ?? '?').toUpperCase()
})

const DIFFICULTY = {
  BEGINNER:     { label: 'Débutant',      class: 'bg-emerald-50 text-emerald-700' },
  INTERMEDIATE: { label: 'Intermédiaire', class: 'bg-amber-50 text-amber-700' },
  ADVANCED:     { label: 'Avancé',        class: 'bg-red-50 text-red-700' },
}

const GRADIENTS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-violet-500 to-purple-700',
  'bg-gradient-to-br from-emerald-400 to-teal-600',
  'bg-gradient-to-br from-orange-400 to-rose-500',
]

const difficultyLabel = computed(() => DIFFICULTY[course.value?.difficulty?.toUpperCase()]?.label ?? course.value?.difficulty)
const difficultyClass = computed(() => DIFFICULTY[course.value?.difficulty?.toUpperCase()]?.class ?? 'bg-slate-100 text-slate-600')
const coverGradient = computed(() => GRADIENTS[(course.value?.id ?? 0) % GRADIENTS.length])
</script>
