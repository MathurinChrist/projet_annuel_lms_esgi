<template>
  <div>

    <!-- En-tête -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Dashboard</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">Mes cours</span>
        </nav>
        <h1 class="text-3xl font-black tracking-tight">Mes cours</h1>
        <p class="text-slate-400 text-sm mt-1">Gérez vos brouillons et cours publiés.</p>
      </div>
      <NuxtLink
        :to="localePath('/instructor/courses/create')"
        class="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors shrink-0"
      >
        <PlusCircle :size="16" />
        Nouveau cours
      </NuxtLink>
    </div>

    <!-- Filtres -->
    <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
      <button
        v-for="f in filters"
        :key="f.value"
        class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all"
        :class="activeFilter === f.value
          ? 'bg-primary text-white shadow-md shadow-blue-200'
          : 'bg-white border border-slate-200 text-slate-500 hover:border-primary'"
        @click="activeFilter = f.value"
      >
        <span v-if="f.dot" class="size-2 rounded-full" :class="f.dot" />
        {{ f.label }}
        <span
          class="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px]"
          :class="activeFilter === f.value ? 'bg-white/20' : 'bg-slate-100 text-slate-400'"
        >
          {{ counts[f.value] }}
        </span>
      </button>
    </div>

    <!-- Skeleton de chargement -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
        <div class="h-44 bg-slate-100" />
        <div class="p-5 space-y-3">
          <div class="h-3 bg-slate-100 rounded w-1/3" />
          <div class="h-4 bg-slate-100 rounded w-3/4" />
          <div class="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    </div>

    <!-- Grille de cours -->
    <div v-else-if="filteredCourses.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <InstructorCourseCard
        v-for="course in filteredCourses"
        :key="course.id"
        :course="course"
        @open="openCourse(course)"
      />
    </div>

    <!-- État vide -->
    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <div class="size-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen :size="28" class="text-primary" />
      </div>
      <h3 class="font-bold text-slate-700 mb-1">
        {{ activeFilter === 'all' ? 'Aucun cours pour le moment' : activeFilter === 'DRAFT' ? 'Aucun brouillon' : 'Aucun cours publié' }}
      </h3>
      <p class="text-sm text-slate-400 mb-6">Créez votre premier cours pour commencer.</p>
      <NuxtLink
        :to="localePath('/instructor/courses/create')"
        class="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors"
      >
        <PlusCircle :size="16" />
        Créer un cours
      </NuxtLink>
    </div>

  </div>
</template>

<script setup>
import { ChevronRight, PlusCircle, BookOpen } from 'lucide-vue-next'

const localePath = useLocalePath()
const router = useRouter()
const authStore = useAuthStore()

const role = authStore.user?.role
if (role !== 'FORMATEUR' && role !== 'ADMINISTRATEUR') {
  await navigateTo(localePath('/'))
}

const creation = useCourseCreation()
const pending = ref(true)
const courses = ref([])

onMounted(async () => {
  try {
    courses.value = await creation.getCourses()
  } finally {
    pending.value = false
  }
})

const activeFilter = ref('all')

const filters = [
  { value: 'all', label: 'Tous' },
  { value: 'DRAFT', label: 'Brouillons', dot: 'bg-yellow-400' },
  { value: 'PUBLISHED', label: 'Publiés', dot: 'bg-green-500' },
]

const counts = computed(() => ({
  all: courses.value?.length ?? 0,
  DRAFT: courses.value?.filter(c => c.status === 'DRAFT').length ?? 0,
  PUBLISHED: courses.value?.filter(c => c.status === 'PUBLISHED').length ?? 0,
}))

const filteredCourses = computed(() => {
  if (!courses.value) return []
  if (activeFilter.value === 'all') return courses.value
  return courses.value.filter(c => c.status === activeFilter.value)
})

function openCourse(course) {
  const path = course.status === 'PUBLISHED'
    ? `/instructor/courses/${course.slug}/settings`
    : `/instructor/courses/${course.slug}`
  router.push(localePath(path))
}
</script>
