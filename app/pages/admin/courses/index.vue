<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Gestion des cours</h1>
      <p class="text-slate-500">Publier, dépublier et modérer les cours</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-bold text-slate-700 mb-2 block">Rechercher</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Titre du cours..."
            class="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedFetch"
          />
        </div>
        <div>
          <label class="text-sm font-bold text-slate-700 mb-2 block">Statut</label>
          <select
            v-model="filters.status"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="handleFilterChange"
          >
            <option value="">Tous les statuts</option>
            <option value="PUBLISHED">Publiés</option>
            <option value="DRAFT">Brouillons</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Cours</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Auteur</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Catégorie</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Inscriptions</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="course in courses" :key="course.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    v-if="course.coverImage"
                    class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100"
                  >
                    <img :src="course.coverImage" :alt="course.title" class="w-full h-full object-cover" />
                  </div>
                  <div
                    v-else
                    class="w-16 h-16 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                  >
                    <BookOpen :size="24" class="text-white" />
                  </div>
                  <div class="min-w-0">
                    <NuxtLink
                      :to="`/courses/${course.slug}`"
                      class="font-bold text-slate-900 hover:text-primary transition-colors line-clamp-1"
                    >
                      {{ course.title }}
                    </NuxtLink>
                    <p class="text-xs text-slate-500 mt-1">{{ formatDate(course.createdAt) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-slate-900">
                  {{ course.author.firstName }} {{ course.author.lastName }}
                </p>
                <p class="text-xs text-slate-500">{{ course.author.email }}</p>
              </td>
              <td class="px-6 py-4">
                <span v-if="course.category" class="text-sm text-slate-700">
                  {{ course.category.name }}
                </span>
                <span v-else class="text-sm text-slate-400">Non catégorisé</span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-3 py-1 rounded-lg text-xs font-bold"
                  :class="course.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                >
                  {{ course.published ? 'Publié' : 'Brouillon' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <Users :size="16" class="text-slate-400" />
                  <span class="text-sm font-medium text-slate-700">{{ course._count.enrollments }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="togglePublish(course)"
                    class="px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                    :class="
                      course.published
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    "
                  >
                    {{ course.published ? 'Dépublier' : 'Publier' }}
                  </button>
                  <NuxtLink
                    :to="`/courses/${course.slug}`"
                    class="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Voir le cours"
                  >
                    <ExternalLink :size="18" class="text-slate-600" />
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
        <p class="text-sm text-slate-600">
          Page {{ currentPage }} sur {{ totalPages }} ({{ total }} cours)
        </p>
        <div class="flex gap-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Précédent
          </button>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookOpen, Users, ExternalLink } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

const token = useCookie('token')
const courses = ref([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const limit = 15

const filters = ref({
  search: '',
  status: '',
})

function authHeaders() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}

const totalPages = computed(() => Math.ceil(total.value / limit))

async function fetchCourses() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(limit),
    })
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.status) params.append('status', filters.value.status)

    const data = await $fetch(`/api/admin/courses?${params.toString()}`, {
      headers: authHeaders(),
    })
    courses.value = data.courses
    total.value = data.total
  } catch (error) {
    console.error('Erreur de chargement:', error)
  } finally {
    loading.value = false
  }
}

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
    fetchCourses()
  }, 300)
}

function handleFilterChange() {
  currentPage.value = 1
  fetchCourses()
}

async function togglePublish(course) {
  try {
    await $fetch(`/api/admin/courses/${course.id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { published: !course.published },
    })
    course.published = !course.published
    course.status = course.published ? 'PUBLISHED' : 'DRAFT'
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors de la modification du statut')
  }
}

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchCourses()
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchCourses()
})
</script>
