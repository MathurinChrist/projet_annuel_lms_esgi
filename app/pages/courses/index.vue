<template>
  <div v-if="isInstructor">

    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">{{ $t('nav.dashboard') }}</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">{{ $t('instructor.courses_title') }}</span>
        </nav>
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight">{{ $t('instructor.courses_title') }}</h1>
        <p class="text-slate-400 text-sm mt-1">{{ $t('instructor.courses_subtitle') }}</p>
      </div>
      <NuxtLink
        :to="localePath('/instructor/courses/create')"
        class="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors shrink-0"
      >
        <PlusCircle :size="16" />
        {{ $t('instructor.create_course') }}
      </NuxtLink>
    </div>

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

    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
        <div class="h-44 bg-slate-100" />
        <div class="p-5 space-y-3">
          <div class="h-3 bg-slate-100 rounded w-1/3" />
          <div class="h-4 bg-slate-100 rounded w-3/4" />
          <div class="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    </div>

    <div v-else-if="filteredCourses.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      <InstructorCourseCard
        v-for="course in filteredCourses"
        :key="course.id"
        :course="course"
        @open="openCourse(course)"
        @feedback="router.push(localePath(`/instructor/courses/${course.slug}/feedback`))"
      />
    </div>

    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <div class="size-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen :size="28" class="text-primary" />
      </div>
      <h3 class="font-bold text-slate-700 mb-1">
        {{ activeFilter === 'all' ? $t('instructor.empty_all') : activeFilter === 'DRAFT' ? $t('instructor.empty_draft') : $t('instructor.empty_published') }}
      </h3>
      <p class="text-sm text-slate-400 mb-6">{{ $t('instructor.courses_empty') }}</p>
      <NuxtLink
        :to="localePath('/instructor/courses/create')"
        class="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors"
      >
        <PlusCircle :size="16" />
        {{ $t('instructor.create_course') }}
      </NuxtLink>
    </div>

  </div>

  <div v-else>
    <div class="mb-8">
      <nav class="flex items-center gap-1.5 mb-3">
        <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">{{ $t('nav.dashboard') }}</NuxtLink>
        <ChevronRight :size="14" class="text-slate-400" />
        <span class="text-slate-700 text-sm font-semibold">{{ $t('myCourses.title') }}</span>
      </nav>
      <h1 class="text-2xl sm:text-3xl font-black tracking-tight">{{ $t('myCourses.title') }}</h1>
      <p class="text-slate-400 text-sm mt-1">{{ $t('myCourses.subtitle') }}</p>
    </div>

    <div v-if="studentPending" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
        <div class="h-44 bg-slate-100" />
        <div class="p-5 space-y-3">
          <div class="h-3 bg-slate-100 rounded w-1/3" />
          <div class="h-4 bg-slate-100 rounded w-3/4" />
          <div class="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    </div>

    <div v-else-if="enrollments.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
            <span class="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
              {{ enrollment.course.category?.name ?? $t('common.general') }}
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
            <span>{{ enrollment.progress === 100 ? $t('catalog.continue_course') : (enrollment.progress > 0 ? $t('instructor.continue_learning') : $t('catalog.start_course')) }}</span>
            <ArrowRight :size="14" class="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <div class="size-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen :size="28" class="text-primary" />
      </div>
      <h3 class="font-bold text-slate-700 mb-1">{{ $t('myCourses.empty_title') }}</h3>
      <p class="text-sm text-slate-400 mb-6">{{ $t('myCourses.empty_subtitle') }}</p>
      <NuxtLink
        :to="localePath('/catalog')"
        class="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors"
      >
        <Compass :size="16" />
        {{ $t('myCourses.browse_courses') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ChevronRight, PlusCircle, BookOpen, BookCheck, ArrowRight, Compass } from 'lucide-vue-next'

const { t } = useI18n()

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

onMounted(async () => {
  if (isInstructor) {
    try {
      courses.value = await creation.getCourses()
    } finally {
      pending.value = false
    }
  } else {
    try {
      enrollments.value = await student.getEnrollments()
    } catch {
      enrollments.value = []
    } finally {
      studentPending.value = false
    }
  }
})

const activeFilter = ref('all')

const filters = computed(() => [
  { value: 'all', label: t('common.all') },
  { value: 'DRAFT', label: t('common.drafts'), dot: 'bg-yellow-400' },
  { value: 'PUBLISHED', label: t('common.published'), dot: 'bg-green-500' },
])

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

