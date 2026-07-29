<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Gestion des utilisateurs</h1>
      <p class="text-slate-500">Gérer les rôles, statuts et permissions</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="text-sm font-bold text-slate-700 mb-2 block">Rechercher</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nom, email..."
            class="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedFetch"
          />
        </div>
        <div>
          <label class="text-sm font-bold text-slate-700 mb-2 block">Rôle</label>
          <select
            v-model="filters.role"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="fetchUsers"
          >
            <option value="">Tous les rôles</option>
            <option value="ADMINISTRATEUR">Administrateur</option>
            <option value="FORMATEUR">Formateur</option>
            <option value="APPRENANT">Apprenant</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-bold text-slate-700 mb-2 block">Statut</label>
          <select
            v-model="filters.active"
            class="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="fetchUsers"
          >
            <option value="">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
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
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Utilisateur</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Rôle</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Date création</th>
              <th class="text-right px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {{ getInitials(user) }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900">{{ user.firstName }} {{ user.lastName }}</p>
                    <p class="text-sm text-slate-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <select
                  :value="user.role"
                  class="px-3 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer"
                  :class="getRoleBadgeClass(user.role)"
                  @change="onRoleChange(user, $event)"
                >
                  <option value="ADMINISTRATEUR">Administrateur</option>
                  <option value="FORMATEUR">Formateur</option>
                  <option value="APPRENANT">Apprenant</option>
                </select>
              </td>
              <td class="px-6 py-4">
                <button
                  @click="toggleStatus(user)"
                  class="px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                  :class="user.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'"
                >
                  {{ user.active ? 'Actif' : 'Inactif' }}
                </button>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="toggleStatus(user)"
                    class="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    :title="user.active ? 'Désactiver' : 'Activer'"
                  >
                    <component :is="user.active ? ShieldOff : ShieldCheck" :size="18" class="text-slate-600" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
        <p class="text-sm text-slate-600">
          Page {{ currentPage }} sur {{ totalPages }} ({{ total }} utilisateurs)
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
import { ShieldCheck, ShieldOff } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

const token = useCookie('token')
const users = ref([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const limit = 15

const filters = ref({
  search: '',
  role: '',
  active: '',
})

function authHeaders() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}

const totalPages = computed(() => Math.ceil(total.value / limit))

async function fetchUsers() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(limit),
    })
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.role) params.append('role', filters.value.role)
    if (filters.value.active) params.append('active', filters.value.active)

    const data = await $fetch(`/api/admin/users?${params.toString()}`, {
      headers: authHeaders(),
    })
    users.value = data.users
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
    fetchUsers()
  }, 300)
}

async function toggleStatus(user) {
  try {
    await $fetch(`/api/admin/users/${user.id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { active: !user.active },
    })
    user.active = !user.active
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors de la modification du statut')
  }
}

function onRoleChange(user, event) {
  updateRole(user, event.target.value)
}

async function updateRole(user, newRole) {
  try {
    await $fetch(`/api/admin/users/${user.id}/role`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { role: newRole },
    })
    user.role = newRole
  } catch (error) {
    console.error('Erreur:', error)
    alert(error?.data?.statusMessage || 'Erreur lors de la modification du rôle')
    await fetchUsers()
  }
}

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchUsers()
  }
}

function getInitials(user) {
  const first = user.firstName?.[0] || ''
  const last = user.lastName?.[0] || ''
  return (first + last).toUpperCase() || user.email[0].toUpperCase()
}

function getRoleBadgeClass(role) {
  switch (role) {
    case 'ADMINISTRATEUR':
      return 'bg-blue-100 text-blue-700'
    case 'FORMATEUR':
      return 'bg-purple-100 text-purple-700'
    case 'APPRENANT':
      return 'bg-slate-100 text-slate-600'
    default:
      return 'bg-slate-100 text-slate-600'
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
  fetchUsers()
})
</script>
