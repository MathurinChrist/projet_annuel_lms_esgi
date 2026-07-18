<template>
  <div>
    <div class="flex items-start justify-between mb-2">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Dashboard</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <NuxtLink :to="localePath('/courses')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Mes cours</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">Étape 2 : Programme</span>
        </nav>
        <h1 class="text-2xl font-black tracking-tight text-slate-900">Structure du programme</h1>
        <p class="text-slate-400 text-sm mt-1">Organisez vos modules et leçons pour guider vos étudiants pas à pas.</p>
      </div>
      <div class="flex items-center gap-3 mt-1 shrink-0">
        <button
          class="flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          @click="handleSaveAndQuit"
        >
          <X :size="15" />
          Sauvegarder &amp; Quitter
        </button>
        <button
          class="flex items-center gap-2 px-5 h-10 rounded-lg bg-primary text-white text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors"
          @click="handleNext"
        >
          Étape suivante
          <ChevronRight :size="15" />
        </button>
      </div>
    </div>

    <InstructorCourseCreationStepper :current-step="2" :steps="COURSE_STEPS" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <div class="lg:col-span-2 space-y-4">

        <div class="flex items-center justify-between sticky top-0 bg-slate-50 py-2 z-10">
          <div class="flex items-center gap-2">
            <LayoutList :size="18" class="text-slate-400" />
            <h3 class="font-bold">Modules du cours</h3>
          </div>
        </div>

        <div
          v-for="(module, index) in modules"
          :key="module.id"
          class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
        >
          <div class="p-4 bg-[#f8f9fc] border-b border-slate-200 flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <GripVertical :size="18" class="text-slate-300 cursor-grab shrink-0" />
              <span class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0">
                Module {{ String(index + 1).padStart(2, '0') }}
              </span>
              <input
                v-model="module.title"
                type="text"
                class="bg-transparent border-none p-0 focus:ring-0 font-bold text-sm w-full outline-none"
              />
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button class="p-1 hover:bg-slate-200 rounded transition-colors" @click="toggleModule(module.id)">
                <ChevronUp v-if="module.expanded" :size="18" />
                <ChevronDown v-else :size="18" />
              </button>
              <button class="p-1 hover:bg-slate-200 rounded transition-colors text-red-400" @click="removeModule(module.id)">
                <Trash2 :size="18" />
              </button>
            </div>
          </div>

          <div v-if="module.expanded" class="p-4 space-y-3">
            <div
              v-for="lesson in module.lessons"
              :key="lesson.id"
              class="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white hover:border-primary/30 transition-all group/item"
            >
              <div class="flex items-center gap-3">
                <GripVertical :size="14" class="text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity cursor-grab" />
                <div class="size-8 flex items-center justify-center rounded-lg shrink-0" :class="LESSON_TYPE_CONFIG[lesson.type].bg">
                  <component :is="LESSON_TYPE_CONFIG[lesson.type].icon" :size="16" :class="LESSON_TYPE_CONFIG[lesson.type].color" />
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-semibold">{{ lesson.title }}</span>
                  <span class="text-[10px] text-slate-400">{{ LESSON_TYPE_CONFIG[lesson.type].label }} • {{ lesson.meta }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <button class="p-1.5 hover:bg-slate-50 rounded text-slate-400" @click="openEditLessonModal(module.id, lesson)"><Pencil :size="14" /></button>
                <button class="p-1.5 hover:bg-slate-50 rounded text-red-400" @click="removeLesson(module.id, lesson.id)"><Trash2 :size="14" /></button>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100">
              <button
                v-for="type in LESSON_CONTENT_TYPES"
                :key="type.value"
                class="flex flex-col items-center gap-1 p-2 rounded-lg border border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary"
                @click="openLessonModal(module.id, type.value)"
              >
                <component :is="type.icon" :size="18" />
                <span class="text-[10px] font-bold">{{ type.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <button
          class="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-white transition-all"
          @click="addModule"
        >
          <PlusCircle :size="28" />
          <span class="text-sm font-bold">Ajouter un nouveau module</span>
        </button>
      </div>

      <div class="space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h4 class="font-bold text-sm mb-4">Récapitulatif du cours</h4>
          <div class="space-y-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400">Modules</span>
              <span class="font-bold">{{ modules.length }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400">Leçons</span>
              <span class="font-bold">{{ totalLessons }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400">Durée estimée</span>
              <span class="font-bold">{{ totalDuration }}</span>
            </div>
            <div class="pt-4 border-t border-slate-100">
              <span class="text-[10px] font-black uppercase text-slate-400 block mb-2">Répartition du contenu</span>
              <div class="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="bg-primary transition-all" :style="{ width: contentMix.video + '%' }" />
                <div class="bg-orange-500 transition-all" :style="{ width: contentMix.pdf + '%' }" />
                <div class="bg-green-500 transition-all" :style="{ width: contentMix.quiz + '%' }" />
                <div class="bg-purple-500 transition-all" :style="{ width: contentMix.text + '%' }" />
              </div>
              <div class="flex gap-4 mt-3 flex-wrap">
                <div class="flex items-center gap-1.5"><div class="size-2 rounded-full bg-primary" /><span class="text-[9px] font-medium">Vidéo</span></div>
                <div class="flex items-center gap-1.5"><div class="size-2 rounded-full bg-orange-500" /><span class="text-[9px] font-medium">PDF</span></div>
                <div class="flex items-center gap-1.5"><div class="size-2 rounded-full bg-green-500" /><span class="text-[9px] font-medium">Quiz</span></div>
                <div class="flex items-center gap-1.5"><div class="size-2 rounded-full bg-purple-500" /><span class="text-[9px] font-medium">Texte</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-10 flex justify-between items-center pt-6 border-t border-slate-200">
      <div class="flex items-center gap-3">
        <NuxtLink
          :to="localePath(`/instructor/courses/${slug}`)"
          class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft :size="14" />
          Étape précédente
        </NuxtLink>
        <button
          v-if="courseStatus === 'DRAFT'"
          type="button"
          class="px-5 py-2.5 rounded-lg border border-red-200 text-sm font-bold text-red-500 flex items-center gap-2 hover:bg-red-50 transition-colors"
          @click="handleAbandonDraft"
        >
          <Trash2 :size="14" />
          Abandonner le brouillon
        </button>
      </div>

      <UiSaveStatus :is-dirty="isDirty" />

      <div class="flex gap-3">
        <button class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold bg-white hover:bg-slate-50 transition-colors" @click="handleSaveDraft">
          {{ courseStatus === 'PUBLISHED' ? 'Enregistrer' : 'Enregistrer comme brouillon' }}
        </button>
        <button
          class="px-7 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2"
          @click="handleNext"
        >
          Étape suivante : Paramètres
          <ChevronRight :size="15" />
        </button>
      </div>
    </div>

    <InstructorLessonModal
      :open="lessonModal.open"
      :type="lessonModal.type"
      :edit-lesson="lessonModal.editLesson"
      @close="closeLessonModal"
      @save="onLessonSaved"
    />
  </div>
</template>

<script setup>
import {
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  X,
  GripVertical,
  LayoutList,
  PlusCircle,
  Trash2,
  Pencil,
} from 'lucide-vue-next'
import { COURSE_STEPS } from '~/utils/courseSteps'
import { LESSON_TYPE_CONFIG, LESSON_CONTENT_TYPES } from '~/utils/lessonTypes'
import { parseDurationMinutes, formatDuration } from '~/utils/duration'

const route = useRoute()
const localePath = useLocalePath()
const creation = useCourseCreation()

const slug = route.params.slug

const courseId = ref(null)
const courseStatus = ref(null)
const modules = reactive([])
const lessonModal = reactive({ open: false, type: null, moduleId: null, editLesson: null })
const { isDirty, markDirty, markSaved } = useSaveStatus()

function lessonFromApi(l) {
  return {
    id: l.id,
    title: l.title,
    type: l.type.toLowerCase(),
    meta: l.duration || '-',
    content: l.content ?? null,
    url: l.url ?? null,
    videoSource: l.videoSource ?? null,
    questions: l.questions ?? [],
  }
}

onMounted(async () => {
  try {
    const course = await creation.getCourse(slug)
    courseId.value = course.id
    courseStatus.value = course.status
    course.modules.forEach(m => {
      modules.push({
        id: m.id,
        title: m.title,
        savedTitle: m.title,
        expanded: true,
        lessons: m.lessons.map(lessonFromApi),
      })
    })
  } catch {
    navigateTo(localePath('/courses'))
    return
  }
  watch(modules, markDirty, { deep: true })
})

const totalLessons = computed(() => modules.reduce((sum, m) => sum + m.lessons.length, 0))

const totalDuration = computed(() => {
  const all = modules.flatMap(m => m.lessons)
  const mins = all.reduce((sum, l) => sum + parseDurationMinutes(l.meta), 0)
  return formatDuration(mins)
})

const contentMix = computed(() => {
  const all = modules.flatMap(m => m.lessons)
  const total = all.length || 1
  return {
    video: Math.round(all.filter(l => l.type === 'video').length / total * 100),
    pdf: Math.round(all.filter(l => l.type === 'pdf').length / total * 100),
    quiz: Math.round(all.filter(l => l.type === 'quiz').length / total * 100),
    text: Math.round(all.filter(l => l.type === 'text').length / total * 100),
  }
})

async function addModule() {
  const data = await creation.addModule(courseId.value, 'Nouveau module')
  modules.push({ id: data.id, title: data.title, savedTitle: data.title, expanded: true, lessons: [] })
  markDirty()
}

async function savePendingModules() {
  const dirty = modules.filter(m => m.title !== m.savedTitle)
  await Promise.all(dirty.map(async m => {
    await creation.updateModule(m.id, { title: m.title })
    m.savedTitle = m.title
  }))
}

async function handleSaveDraft() {
  try {
    await savePendingModules()
    await nextTick()
    markSaved()
  } catch (e) {
    console.error(e)
  }
}

async function removeModule(id) {
  await creation.deleteModule(id)
  const i = modules.findIndex(m => m.id === id)
  if (i !== -1) modules.splice(i, 1)
}

function toggleModule(id) {
  const m = modules.find(m => m.id === id)
  if (m) m.expanded = !m.expanded
}

function openLessonModal(moduleId, type) {
  lessonModal.moduleId = moduleId
  lessonModal.type = type
  lessonModal.editLesson = null
  lessonModal.open = true
}

function openEditLessonModal(moduleId, lesson) {
  lessonModal.moduleId = moduleId
  lessonModal.type = lesson.type
  lessonModal.editLesson = lesson
  lessonModal.open = true
}

function closeLessonModal() {
  lessonModal.open = false
  lessonModal.editLesson = null
}

async function onLessonSaved(lessonData) {
  if (lessonModal.editLesson) {
    const data = await creation.updateLesson(lessonModal.editLesson.id, lessonData)
    const m = modules.find(m => m.id === lessonModal.moduleId)
    if (m) {
      const idx = m.lessons.findIndex(l => l.id === lessonModal.editLesson.id)
      if (idx !== -1) m.lessons.splice(idx, 1, lessonFromApi(data))
    }
  } else {
    const data = await creation.addLesson(lessonModal.moduleId, lessonData)
    const m = modules.find(m => m.id === lessonModal.moduleId)
    if (m) m.lessons.push(lessonFromApi(data))
  }
  closeLessonModal()
}

async function removeLesson(moduleId, lessonId) {
  await creation.deleteLesson(lessonId)
  const m = modules.find(m => m.id === moduleId)
  if (!m) return
  const i = m.lessons.findIndex(l => l.id === lessonId)
  if (i !== -1) m.lessons.splice(i, 1)
}

async function handleSaveAndQuit() {
  try {
    await savePendingModules()
    await nextTick()
    markSaved()
  } catch (e) {
    console.error(e)
  }
  navigateTo(localePath('/courses'))
}

async function handleAbandonDraft() {
  if (!confirm('Supprimer ce brouillon ? Cette action est irréversible.')) return
  try {
    await creation.deleteCourse(courseId.value)
    navigateTo(localePath('/courses'))
  } catch {
    console.error('Erreur lors de la suppression du brouillon')
  }
}

async function handleNext() {
  try {
    await savePendingModules()
    await nextTick()
    markSaved()
  } catch (e) {
    console.error(e)
    return
  }
  navigateTo(localePath(`/instructor/courses/${slug}/settings`))
}
</script>
