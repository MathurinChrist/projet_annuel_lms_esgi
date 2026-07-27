<template>
  <div>
    <div class="mb-6">
      <nav class="flex items-center gap-1.5 mb-3">
        <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">{{ $t('nav.dashboard') }}</NuxtLink>
        <ChevronRight :size="14" class="text-slate-400" />
        <span class="text-slate-700 text-sm font-semibold">{{ $t('catalog.title') }}</span>
      </nav>
      <h1 class="text-3xl font-black tracking-tight">{{ $t('catalog.title') }}</h1>
      <p class="text-slate-400 text-sm mt-1">{{ $t('catalog.subtitle') }}</p>
    </div>

    <div class="relative mb-6 max-w-xl">
      <Search :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        v-model="search"
        type="text"
        class="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
        :placeholder="$t('catalog.search_placeholder')"
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div class="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          class="px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all"
          :class="categoryId === null ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-primary'"
          @click="categoryId = null"
        >
          {{ $t('catalog.all_categories') }}
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all"
          :class="categoryId === cat.id ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-primary'"
          @click="categoryId = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <div class="relative">
          <button
            class="flex items-center gap-2 px-4 h-9 rounded-lg border text-xs font-bold transition-all"
            :class="hasActiveFilters ? 'border-primary text-primary bg-primary/5' : 'border-slate-200 text-slate-600 bg-white hover:border-primary'"
            @click="showFilters = !showFilters"
          >
            <SlidersHorizontal :size="14" />
            {{ $t('catalog.filters') }}
            <span v-if="activeFilterCount" class="bg-primary text-white rounded-full size-4 text-[10px] flex items-center justify-center">{{ activeFilterCount }}</span>
          </button>

          <div
            v-if="showFilters"
            v-click-outside="() => (showFilters = false)"
            class="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-5 z-30"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold">{{ $t('catalog.filters') }}</h3>
              <button class="text-primary text-xs font-bold hover:underline" @click="clearFilters">{{ $t('catalog.clear_filters') }}</button>
            </div>

            <div class="space-y-5">
              <div class="space-y-2.5">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ $t('catalog.difficulty') }}</p>
                <label v-for="opt in difficultyOptions" :key="opt.value" class="flex items-center gap-2.5 cursor-pointer group">
                  <input v-model="difficulties" type="checkbox" :value="opt.value" class="rounded border-slate-300 text-primary focus:ring-primary size-4" />
                  <span class="text-sm text-slate-700 group-hover:text-primary transition-colors">{{ opt.label }}</span>
                </label>
              </div>

              <div class="space-y-2.5">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ $t('catalog.duration') }}</p>
                <label v-for="opt in durationOptions" :key="opt.value" class="flex items-center gap-2.5 cursor-pointer group">
                  <input v-model="duration" type="radio" name="duration" :value="opt.value" class="border-slate-300 text-primary focus:ring-primary size-4" />
                  <span class="text-sm text-slate-700 group-hover:text-primary transition-colors">{{ opt.label }}</span>
                </label>
              </div>
            </div>

            <button
              class="mt-5 w-full bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
              @click="showFilters = false"
            >
              {{ $t('catalog.apply_filters') }}
            </button>
          </div>
        </div>

        <select
          v-model="sort"
          class="h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="popular">{{ $t('catalog.sort_popular') }}</option>
          <option value="newest">{{ $t('catalog.sort_newest') }}</option>
          <option value="rating">{{ $t('catalog.sort_rating') }}</option>
        </select>
      </div>
    </div>

    <p v-if="!pending" class="text-xs text-slate-400 font-medium mb-4">
      {{ $t('catalog.results_count', { count: total, plural: total > 1 ? 's' : '' }) }}
    </p>

    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
        <div class="h-40 bg-slate-100" />
        <div class="p-5 space-y-3">
          <div class="h-3 bg-slate-100 rounded w-1/3" />
          <div class="h-4 bg-slate-100 rounded w-3/4" />
          <div class="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    </div>

    <div v-else-if="courses.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <CatalogCourseCard v-for="course in courses" :key="course.id" :course="course" />
    </div>

    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <div class="size-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
        <SearchX :size="28" class="text-primary" />
      </div>
      <h3 class="font-bold text-slate-700 mb-1">{{ $t('catalog.empty_title') }}</h3>
      <p class="text-sm text-slate-400">{{ $t('catalog.empty_subtitle') }}</p>
    </div>

    <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-2">
      <button
        class="flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="page <= 1"
        @click="page--"
      >
        <ChevronLeft :size="16" />
      </button>
      <button
        v-for="p in totalPages"
        :key="p"
        class="flex items-center justify-center h-10 w-10 rounded-lg text-sm font-bold transition-colors"
        :class="p === page ? 'bg-primary text-white' : 'border border-slate-200 hover:bg-slate-50'"
        @click="page = p"
      >
        {{ p }}
      </button>
      <button
        class="flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="page >= totalPages"
        @click="page++"
      >
        <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ChevronRight, ChevronLeft, Search, SearchX, SlidersHorizontal } from 'lucide-vue-next'

const localePath = useLocalePath()
const route = useRoute()
const { t } = useI18n()
const courseApi = useCourses()

const vClickOutside = {
  mounted(el, binding) {
    el.__clickOutside__ = (e) => { if (!el.contains(e.target)) binding.value(e) }
    document.addEventListener('click', el.__clickOutside__, true)
  },
  unmounted(el) {
    document.removeEventListener('click', el.__clickOutside__, true)
  },
}

const difficultyOptions = computed(() => [
  { value: 'BEGINNER', label: t('catalog.difficulty_beginner') },
  { value: 'INTERMEDIATE', label: t('catalog.difficulty_intermediate') },
  { value: 'ADVANCED', label: t('catalog.difficulty_advanced') },
])

const durationOptions = computed(() => [
  { value: 'under2', label: t('catalog.duration_under_2h') },
  { value: '2to5', label: t('catalog.duration_2_5h') },
  { value: '5plus', label: t('catalog.duration_5h_plus') },
])

const categories = ref([])
const courses = ref([])
const total = ref(0)
const pending = ref(true)
const showFilters = ref(false)

const search = ref(typeof route.query.search === 'string' ? route.query.search : '')
const categoryId = ref(null)
const difficulties = ref([])
const duration = ref('')
const sort = ref('popular')
const page = ref(1)
const limit = 9

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))
const hasActiveFilters = computed(() => difficulties.value.length > 0 || !!duration.value)
const activeFilterCount = computed(() => difficulties.value.length + (duration.value ? 1 : 0))

function clearFilters() {
  difficulties.value = []
  duration.value = ''
}

let debounceTimer = null
async function fetchCourses() {
  pending.value = true
  try {
    const data = await courseApi.getCatalog({
      search: search.value || undefined,
      category: categoryId.value || undefined,
      difficulty: difficulties.value.length ? difficulties.value : undefined,
      duration: duration.value || undefined,
      sort: sort.value,
      page: page.value,
      limit,
    })
    courses.value = data.courses
    total.value = data.total
  } catch {
    courses.value = []
    total.value = 0
  } finally {
    pending.value = false
  }
}

watch(search, () => {
  page.value = 1
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchCourses, 350)
})

watch([categoryId, difficulties, duration, sort], () => {
  page.value = 1
  fetchCourses()
}, { deep: true })

watch(page, fetchCourses)

onMounted(async () => {
  try {
    categories.value = await courseApi.getCategories()
  } catch {
    categories.value = []
  }
  await fetchCourses()
})
</script>
