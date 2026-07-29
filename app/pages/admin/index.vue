<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Tableau de bord administrateur</h1>
      <p class="text-slate-500">Vue d'ensemble de la plateforme</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="stats" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-blue-100 p-3 rounded-xl">
              <Users class="text-blue-600" :size="24" />
            </div>
            <TrendingUp class="text-emerald-500" :size="20" />
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Utilisateurs</p>
          <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.totalUsers }}</p>
          <p class="text-xs text-emerald-600 mt-2">{{ stats.activeUsers }} actifs</p>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-purple-100 p-3 rounded-xl">
              <BookOpen class="text-purple-600" :size="24" />
            </div>
            <TrendingUp class="text-emerald-500" :size="20" />
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cours</p>
          <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.totalCourses }}</p>
          <p class="text-xs text-blue-600 mt-2">{{ stats.publishedCourses }} publiés</p>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-emerald-100 p-3 rounded-xl">
              <GraduationCap class="text-emerald-600" :size="24" />
            </div>
            <TrendingUp class="text-emerald-500" :size="20" />
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inscriptions</p>
          <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.totalEnrollments }}</p>
          <p class="text-xs text-slate-500 mt-2">Tous cours confondus</p>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-amber-100 p-3 rounded-xl">
              <FileText class="text-amber-600" :size="24" />
            </div>
            <TrendingUp class="text-slate-400" :size="20" />
          </div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Cours Brouillons</p>
          <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.draftCourses }}</p>
          <p class="text-xs text-slate-500 mt-2">En attente de publication</p>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-blue-100 p-2 rounded-lg">
            <Shield class="text-blue-600" :size="20" />
          </div>
          <h2 class="text-lg font-bold text-slate-900">Répartition par rôle</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div>
              <p class="text-sm font-bold text-slate-600">Administrateurs</p>
              <p class="text-2xl font-bold text-blue-700 mt-1">{{ stats.usersByRole.ADMINISTRATEUR }}</p>
            </div>
            <div class="bg-blue-100 p-3 rounded-lg">
              <Shield class="text-blue-600" :size="20" />
            </div>
          </div>
          <div class="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
            <div>
              <p class="text-sm font-bold text-slate-600">Formateurs</p>
              <p class="text-2xl font-bold text-purple-700 mt-1">{{ stats.usersByRole.FORMATEUR }}</p>
            </div>
            <div class="bg-purple-100 p-3 rounded-lg">
              <Users class="text-purple-600" :size="20" />
            </div>
          </div>
          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p class="text-sm font-bold text-slate-600">Apprenants</p>
              <p class="text-2xl font-bold text-slate-700 mt-1">{{ stats.usersByRole.APPRENANT }}</p>
            </div>
            <div class="bg-slate-100 p-3 rounded-lg">
              <Users class="text-slate-600" :size="20" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink
          to="/admin/users"
          class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
        >
          <div class="flex items-center justify-between mb-4">
            <Users :size="32" class="opacity-90" />
            <ArrowRight :size="24" class="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
          </div>
          <h3 class="text-xl font-bold mb-2">Gestion des utilisateurs</h3>
          <p class="text-blue-100 text-sm">Gérer les rôles, statuts et permissions</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/courses"
          class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
        >
          <div class="flex items-center justify-between mb-4">
            <BookOpen :size="32" class="opacity-90" />
            <ArrowRight :size="24" class="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
          </div>
          <h3 class="text-xl font-bold mb-2">Gestion des cours</h3>
          <p class="text-purple-100 text-sm">Publier, dépublier et modérer les cours</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Users, BookOpen, GraduationCap, FileText, Shield, TrendingUp, ArrowRight } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

const token = useCookie('token')
const stats = ref(null)
const loading = ref(true)

function authHeaders() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}

onMounted(async () => {
  try {
    stats.value = await $fetch('/api/admin/stats', { headers: authHeaders() })
  } catch (error) {
    console.error('Erreur de chargement des stats:', error)
  } finally {
    loading.value = false
  }
})
</script>
