<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <div class="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Gestion des catégories</h1>
        <p class="text-slate-500">Organisez les cours par catégories et sous-catégories</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Plus :size="20" />
        Nouvelle catégorie
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="categories.length === 0" class="bg-white border border-slate-200 rounded-2xl p-12 text-center">
      <div class="flex justify-center mb-4">
        <div class="bg-slate-100 p-4 rounded-full">
          <Folder :size="48" class="text-slate-400" />
        </div>
      </div>
      <h3 class="text-lg font-semibold text-slate-900 mb-2">Aucune catégorie</h3>
      <p class="text-slate-500 mb-6">Créez votre première catégorie pour organiser les cours</p>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        <Plus :size="20" />
        Créer une catégorie
      </button>
    </div>

    <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="divide-y divide-slate-200">
        <template v-for="category in categories" :key="category.id">
          <div class="p-6 hover:bg-slate-50 transition-colors">
            <div class="flex items-center gap-4">
              <button
                v-if="category.children && category.children.length > 0"
                @click="toggleExpand(category.id)"
                class="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              >
                <ChevronDown v-if="expandedIds.has(category.id)" :size="18" />
                <ChevronRight v-else :size="18" />
              </button>
              <span v-else class="w-[18px] flex-shrink-0" />

              <div class="bg-blue-100 p-2 rounded-lg">
                <Folder :size="20" class="text-blue-600" />
              </div>

              <div v-if="editingId === category.id" class="flex-1 flex items-center gap-3">
                <input
                  v-model="editingName"
                  type="text"
                  class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  @keyup.enter="saveEdit(category.id)"
                  @keyup.escape="cancelEdit"
                />
                <button
                  @click="saveEdit(category.id)"
                  class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Enregistrer"
                >
                  <Check :size="20" />
                </button>
                <button
                  @click="cancelEdit"
                  class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Annuler"
                >
                  <X :size="20" />
                </button>
              </div>

              <div v-else class="flex-1 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-semibold text-slate-900">{{ category.name }}</h3>
                  <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {{ category._count.courses }} cours
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="startAddingSubCategory(category.id)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ajouter une sous-catégorie"
                  >
                    <FolderPlus :size="20" />
                  </button>
                  <button
                    @click="startEdit(category.id, category.name)"
                    class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Renommer"
                  >
                    <Pencil :size="20" />
                  </button>
                  <button
                    @click="deleteCategory(category.id, category.name)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 :size="20" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <template v-if="category.children && category.children.length > 0 && expandedIds.has(category.id)">
            <div v-for="child in category.children" :key="child.id" class="p-6 pl-20 bg-slate-50/50 hover:bg-slate-100/50 transition-colors border-t border-slate-200">
              <div class="flex items-center gap-4">
                <div class="bg-purple-100 p-2 rounded-lg">
                  <FolderOpen :size="18" class="text-purple-600" />
                </div>

                <div v-if="editingId === child.id" class="flex-1 flex items-center gap-3">
                  <input
                    v-model="editingName"
                    type="text"
                    class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    @keyup.enter="saveEdit(child.id)"
                    @keyup.escape="cancelEdit"
                  />
                  <button
                    @click="saveEdit(child.id)"
                    class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Enregistrer"
                  >
                    <Check :size="20" />
                  </button>
                  <button
                    @click="cancelEdit"
                    class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Annuler"
                  >
                    <X :size="20" />
                  </button>
                </div>

                <div v-else class="flex-1 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-slate-400 mr-2">└─</span>
                    <h4 class="font-medium text-slate-900">{{ child.name }}</h4>
                    <span class="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
                      {{ child._count.courses + child._count.subCategoryCourses }} cours
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      @click="startEdit(child.id, child.name)"
                      class="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Renommer"
                    >
                      <Pencil :size="18" />
                    </button>
                    <button
                      @click="deleteCategory(child.id, child.name)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
      @click.self="closeCreateModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Nouvelle catégorie</h2>
          <button
            @click="closeCreateModal"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X :size="24" />
          </button>
        </div>

        <form @submit.prevent="createCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Nom de la catégorie</label>
            <input
              v-model="newCategoryName"
              type="text"
              required
              placeholder="Ex: Développement Web"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Catégorie parente (optionnel)</label>
            <select
              v-model="newCategoryParentId"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option :value="null">Aucune (catégorie principale)</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeCreateModal"
              class="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Création...' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, Folder, FolderOpen, FolderPlus, Pencil, Trash2, Check, X, ChevronRight, ChevronDown } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

const token = useCookie('token')
const categories = ref([])
const loading = ref(true)
const showCreateModal = ref(false)
const newCategoryName = ref('')
const newCategoryParentId = ref(null)
const submitting = ref(false)
const editingId = ref(null)
const editingName = ref('')
const expandedIds = ref(new Set())

function authHeaders() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}

async function loadCategories() {
  loading.value = true
  try {
    const data = await $fetch('/api/admin/categories', { headers: authHeaders() })
    categories.value = data.categories
  } catch (error) {
    console.error('Erreur de chargement des catégories:', error)
  } finally {
    loading.value = false
  }
}

function toggleExpand(id) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
  expandedIds.value = new Set(expandedIds.value)
}

function startAddingSubCategory(parentId) {
  newCategoryParentId.value = parentId
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
  newCategoryName.value = ''
  newCategoryParentId.value = null
}

async function createCategory() {
  if (!newCategoryName.value.trim()) return

  submitting.value = true
  try {
    await $fetch('/api/admin/categories', {
      method: 'POST',
      headers: authHeaders(),
      body: {
        name: newCategoryName.value.trim(),
        parentId: newCategoryParentId.value
      }
    })
    closeCreateModal()
    await loadCategories()
  } catch (error) {
    console.error('Erreur de création:', error)
    alert(error.data?.statusMessage || 'Erreur lors de la création de la catégorie')
  } finally {
    submitting.value = false
  }
}

function startEdit(id, name) {
  editingId.value = id
  editingName.value = name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

async function saveEdit(id) {
  if (!editingName.value.trim()) return

  try {
    await $fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { name: editingName.value.trim() }
    })
    cancelEdit()
    await loadCategories()
  } catch (error) {
    console.error('Erreur de modification:', error)
    alert(error.data?.statusMessage || 'Erreur lors de la modification')
  }
}

async function deleteCategory(id, name) {
  if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?`)) return

  try {
    await $fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    await loadCategories()
  } catch (error) {
    console.error('Erreur de suppression:', error)
    alert(error.data?.statusMessage || 'Erreur lors de la suppression')
  }
}

onMounted(() => {
  loadCategories()
})
</script>
