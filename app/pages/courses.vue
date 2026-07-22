<template>
  <div v-if="isInstructor">

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
        @feedback="router.push(localePath(`/instructor/courses/${course.slug}/feedback`))"
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

  <!-- Vue étudiant -->
  <div v-else>
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Dashboard</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">Cours</span>
        </nav>
        <h1 class="text-3xl font-black tracking-tight">Espace Apprentissage</h1>
        <p class="text-slate-400 text-sm mt-1">Découvrez de nouveaux cours ou reprenez vos leçons là où vous vous êtes arrêté.</p>
      </div>

      <!-- Navigation par onglets étudiant -->
      <div class="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner w-fit">
        <button
          class="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all"
          :class="studentTab === 'my-courses' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-slate-800'"
          @click="studentTab = 'my-courses'"
        >
          <GraduationCap :size="14" />
          Mes cours ({{ enrollments.length }})
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all text-nowrap"
          :class="studentTab === 'catalog' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-slate-800'"
          @click="studentTab = 'catalog'"
        >
          <Compass :size="14" />
          Catalogue ({{ catalog.length }})
        </button>
      </div>
    </div>

    <!-- ONGLET : MES COURS -->
    <div v-if="studentTab === 'my-courses'">
      <!-- Skeleton de chargement -->
      <div v-if="studentPending" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
          <div class="h-44 bg-slate-100" />
          <div class="p-5 space-y-3">
            <div class="h-3 bg-slate-100 rounded w-1/3" />
            <div class="h-4 bg-slate-100 rounded w-3/4" />
            <div class="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      </div>

      <!-- Grille des cours inscrits -->
      <div v-else-if="enrollments.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <NuxtLink
          v-for="enrollment in enrollments"
          :key="enrollment.course.slug"
          :to="localePath(`/learn/${enrollment.course.slug}`)"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div class="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden relative">
              <img v-if="enrollment.course.coverImage" :src="enrollment.course.coverImage" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <BookOpen v-else :size="32" class="text-white" />
              <!-- Badge de catégorie -->
              <span class="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
                {{ enrollment.course.category?.name ?? 'Général' }}
              </span>
            </div>
            
            <div class="p-5">
              <h3 class="font-bold text-slate-900 mb-1 line-clamp-2 min-h-12 group-hover:text-primary transition-colors">{{ enrollment.course.title }}</h3>
              <div class="flex items-center gap-2 text-xs text-slate-400 mb-4 font-semibold">
                <BookCheck :size="14" class="text-slate-400" />
                <span>{{ $t('dashboard.lessons_count', { count: enrollment.course.lessonCount }) }}</span>
              </div>
            </div>
          </div>

          <div class="px-5 pb-5 pt-0">
            <div class="flex items-center gap-3">
              <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full transition-all duration-500" :style="{ width: `${enrollment.progress}%` }"></div>
              </div>
              <span class="text-xs font-black text-slate-700 shrink-0">{{ enrollment.progress }}%</span>
            </div>
            
            <div class="mt-4 flex items-center justify-between text-xs font-bold text-primary group-hover:underline">
              <span>{{ enrollment.progress === 100 ? 'Recommencer le cours' : (enrollment.progress > 0 ? 'Continuer l\'apprentissage' : 'Démarrer le cours') }}</span>
              <ArrowRight :size="14" class="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- État vide -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-center">
        <div class="size-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen :size="28" class="text-primary" />
        </div>
        <h3 class="font-bold text-slate-700 mb-1">{{ $t('myCourses.empty_title') }}</h3>
        <p class="text-sm text-slate-400 mb-6">{{ $t('myCourses.empty_subtitle') }}</p>
        <button
          class="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
          @click="studentTab = 'catalog'"
        >
          <Compass :size="16" />
          {{ $t('myCourses.browse_courses') }}
        </button>
      </div>
    </div>

    <!-- ONGLET : CATALOGUE (DÉCOUVRIR PRODUITS) -->
    <div v-else-if="studentTab === 'catalog'">
      <!-- Barre d'outils catalogue (Recherche et Filtres rapides) -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un cours par titre ou tags..."
          class="flex-1 px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
        />
        <select
          v-model="selectedDifficulty"
          class="px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold text-slate-700"
        >
          <option value="ALL">Toutes les difficultés</option>
          <option value="BEGINNER">Débutant</option>
          <option value="INTERMEDIATE">Intermédiaire</option>
          <option value="ADVANCED">Avancé</option>
        </select>
      </div>

      <!-- Skeleton de chargement catalogue -->
      <div v-if="catalogPending" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
          <div class="h-44 bg-slate-100" />
          <div class="p-5 space-y-3">
            <div class="h-3 bg-slate-100 rounded w-1/4" />
            <div class="h-4 bg-slate-100 rounded w-3/4" />
            <div class="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      </div>

      <!-- Grille des cours du catalogue -->
      <div v-else-if="filteredCatalog.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="course in filteredCatalog"
          :key="course.id"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-blue-400 hover:shadow-lg transition-all duration-300"
        >
          <div>
            <div class="h-44 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden relative">
              <img v-if="course.coverImage" :src="course.coverImage" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <BookOpen v-else :size="32" class="text-white" />
              
              <!-- Badges positionnés -->
              <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-white text-slate-800 shadow-sm">
                  {{ course.category?.name ?? 'Général' }}
                </span>
                <span
                  class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm text-white"
                  :class="{
                    'bg-emerald-500': course.difficulty === 'BEGINNER',
                    'bg-amber-500': course.difficulty === 'INTERMEDIATE',
                    'bg-rose-500': course.difficulty === 'ADVANCED',
                  }"
                >
                  {{ course.difficulty === 'BEGINNER' ? 'Débutant' : course.difficulty === 'INTERMEDIATE' ? 'Intermédiaire' : 'Avancé' }}
                </span>
              </div>
            </div>

            <div class="p-5 flex-1">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-slate-400 font-semibold">Par {{ course.author?.firstName || 'Formateur' }} {{ course.author?.lastName || '' }}</span>
                <!-- Avis & note moyenne étoiles -->
                <div v-if="course.rating?.count > 0" class="flex items-center gap-1 font-bold">
                  <Star class="text-amber-400 fill-amber-400" :size="14" />
                  <span class="text-xs text-slate-700">{{ course.rating.average.toFixed(1) }}</span>
                  <span class="text-[10px] text-slate-400 font-medium">({{ course.rating.count }})</span>
                </div>
                <div v-else class="text-[10px] text-slate-400 italic">Aucun avis</div>
              </div>
              <h3 class="font-bold text-slate-900 mb-2 text-lg line-clamp-2 min-h-14 group-hover:text-primary transition-colors">
                {{ course.title }}
              </h3>
              <p class="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                {{ course.description || 'Apprenez sans limite grâce à ce cours complet.' }}
              </p>

              <!-- Accordéon pour voir le programme (modules & leçons) -->
              <div class="mt-4 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  class="flex items-center justify-between w-full text-left text-xs font-bold text-slate-600 hover:text-primary transition-colors"
                  @click="toggleProgram(course.id)"
                >
                  <span class="flex items-center gap-1.5">
                    <BookOpen :size="14" class="text-slate-405 text-primary" />
                    Voir le programme ({{ course.modules?.length ?? 0 }} modules)
                  </span>
                  <component :is="expandedPrograms[course.id] ? ChevronUp : ChevronDown" :size="14" />
                </button>

                <!-- Déroulé du programme -->
                <div v-if="expandedPrograms[course.id]" class="mt-3 space-y-3 max-h-56 overflow-y-auto pr-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition-all duration-300">
                  <div v-for="(module, mIdx) in course.modules" :key="module.id" class="space-y-1">
                    <div class="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Module {{ mIdx + 1 }}: {{ module.title }}
                    </div>
                    <div class="pl-2 space-y-1">
                      <div
                        v-for="lesson in module.lessons"
                        :key="lesson.id"
                        class="flex items-center justify-between text-[11px] font-medium text-slate-600 py-0.5 hover:text-primary transition-colors"
                      >
                        <span class="truncate flex-1 pr-2 flex items-center gap-1.5">
                          <component
                            :is="lesson.type.toLowerCase() === 'video' ? Video : (lesson.type.toLowerCase() === 'quiz' ? HelpCircle : FileText)"
                            :size="12"
                            class="text-slate-450 shrink-0"
                          />
                          {{ lesson.title }}
                        </span>
                        <span v-if="lesson.duration" class="text-[10px] text-slate-400 shrink-0 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{{ lesson.duration }}</span>
                      </div>
                      <div v-if="!module.lessons.length" class="text-[10px] text-slate-450 italic pl-4">Aucune leçon pour le moment.</div>
                    </div>
                  </div>
                  <div v-if="!course.modules.length" class="text-xs text-slate-400 italic text-center py-2">Aucun module programmé.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-5 pb-5 pt-0 mt-auto">
            <hr class="border-slate-100 mb-4" />
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1 text-xs font-bold text-slate-500">
                <BookCheck :size="15" class="text-slate-400" />
                <span>{{ course.lessonCount }} leçons</span>
              </div>
              
              <NuxtLink
                :to="localePath(`/learn/${course.slug}`)"
                class="px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1 bg-primary text-white hover:bg-blue-700 shadow-sm"
              >
                <span>{{ course.isEnrolled ? 'Continuer' : 'Commencer' }}</span>
                <ArrowRight :size="12" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Catalogue vide -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-center">
        <div class="size-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
          <Compass :size="28" />
        </div>
        <h3 class="font-bold text-slate-700 mb-1">Aucun cours trouvé</h3>
        <p class="text-sm text-slate-400">Essayez de modifier vos filtres ou de taper un autre mot-clé.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronRight, PlusCircle, BookOpen, GraduationCap, Compass, BookCheck, ArrowRight, Star, ChevronDown, ChevronUp, Video, HelpCircle, FileText } from 'lucide-vue-next'

const localePath = useLocalePath()
const router = useRouter()
const authStore = useAuthStore()

const role = authStore.user?.role
const isInstructor = role === 'FORMATEUR' || role === 'ADMINISTRATEUR'

const creation = useCourseCreation()
const pending = ref(true)
const courses = ref([])

const student = useStudentCourse()
const studentPending = ref(true)
const enrollments = ref([])

// Variables Catalogue Apprenants
const catalog = ref([])
const catalogPending = ref(true)
const studentTab = ref('my-courses')
const searchQuery = ref('')
const selectedDifficulty = ref('ALL')
const expandedPrograms = ref({})

function toggleProgram(id) {
  expandedPrograms.value[id] = !expandedPrograms.value[id]
}

onMounted(async () => {
  if (isInstructor) {
    try {
      courses.value = await creation.getCourses()
    } finally {
      pending.value = false
    }
  } else {
    try {
      // Charger les inscriptions et le catalogue en parallèle
      const [enrollRes, catalogRes] = await Promise.allSettled([
        student.getEnrollments(),
        student.getCatalog()
      ])
      enrollments.value = enrollRes.status === 'fulfilled' ? enrollRes.value : []
      catalog.value = catalogRes.status === 'fulfilled' ? catalogRes.value : []
    } catch {
      enrollments.value = []
      catalog.value = []
    } finally {
      studentPending.value = false
      catalogPending.value = false
    }
  }
})

// Filtrage du catalogue apprenants
const filteredCatalog = computed(() => {
  if (!catalog.value) return []
  return catalog.value.filter(course => {
    // Filtre par recherche texte
    const textMatch = searchQuery.value.trim() === '' ||
      course.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    
    // Filtre par difficulté
    const diffMatch = selectedDifficulty.value === 'ALL' ||
      course.difficulty === selectedDifficulty.value
      
    return textMatch && diffMatch
  })
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

