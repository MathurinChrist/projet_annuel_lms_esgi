<template>
  <div>
    <!-- En-tête de page avec actions -->
    <div class="flex items-start justify-between mb-2">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <NuxtLink :to="localePath('/courses')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">
            Mes cours
          </NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">Étape 1 : Infos générales</span>
        </nav>
        <h1 class="text-2xl font-black tracking-tight text-slate-900">Informations générales</h1>
        <p class="text-slate-400 text-sm mt-1">Définissez les détails fondamentaux du cours pour aider les étudiants à le trouver.</p>
      </div>

      <div class="flex items-center gap-3 mt-1 shrink-0">
        <NuxtLink
          :to="localePath('/courses')"
          class="flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <X :size="15" />
          Quitter
        </NuxtLink>
        <button
          class="flex items-center gap-2 px-5 h-10 rounded-lg bg-primary text-white text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-60"
          :disabled="saving"
          @click="handleSaveAndContinue"
        >
          {{ saving ? 'Sauvegarde…' : 'Sauvegarder & Continuer' }}
          <ChevronRight :size="15" />
        </button>
      </div>
    </div>

    <!-- Barre d'étapes -->
    <InstructorCourseCreationStepper :current-step="1" :steps="COURSE_STEPS" />

    <!-- Grille principale -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Colonne principale : champs du formulaire -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">

          <!-- Titre du cours -->
          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Titre du cours</label>
            <input
              v-model="form.title"
              type="text"
              class="w-full h-12 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
              placeholder="ex. Maîtriser Nuxt.js 3 de zéro à héros"
            />
            <p class="text-xs text-slate-400">Rédigez un titre accrocheur qui inclut les mots-clés recherchés par les étudiants.</p>
          </div>

          <!-- Catégorie / Sous-catégorie -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-800">Catégorie</label>
              <select
                v-model="form.categoryId"
                class="w-full h-12 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all cursor-pointer"
              >
                <option :value="null">Sélectionner une catégorie</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-800">Sous-catégorie</label>
              <select
                v-model="form.subCategoryId"
                :disabled="!subcategories.length"
                class="w-full h-12 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option :value="null">{{ subcategories.length ? 'Sélectionner une sous-catégorie' : "Choisir d'abord une catégorie" }}</option>
                <option v-for="sub in subcategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
              </select>
            </div>
          </div>

          <!-- Niveau de difficulté -->
          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Niveau de difficulté</label>
            <div class="grid grid-cols-3 gap-4">
              <label
                v-for="option in difficultyOptions"
                :key="option.value"
                class="flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all"
                :class="form.difficulty === option.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 text-slate-400 hover:bg-primary/5 hover:border-primary/40'"
              >
                <input v-model="form.difficulty" type="radio" name="difficulty" :value="option.value" class="hidden" />
                <component :is="option.icon" :size="22" class="mb-1.5" />
                <span class="text-xs font-bold">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <!-- Description (éditeur riche) -->
          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Description</label>
            <UiRichTextEditor
              v-model="form.description"
              placeholder="Décrivez ce que les étudiants vont apprendre..."
            />
          </div>

          <!-- Mots-clés -->
          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Mots-clés</label>
            <div class="flex flex-wrap gap-2 p-3 border border-slate-200 bg-slate-50 rounded-lg min-h-12 items-center">
              <span
                v-for="(tag, index) in form.tags"
                :key="tag"
                class="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full"
              >
                {{ tag }}
                <button type="button" class="hover:text-blue-800 transition-colors" @click="removeTag(index)">
                  <X :size="11" />
                </button>
              </span>
              <input
                v-model="newTag"
                type="text"
                class="bg-transparent border-none outline-none focus:ring-0 text-xs min-w-24 placeholder:text-slate-300"
                placeholder="Ajouter un tag…"
                @keydown.enter.prevent="addTag"
                @keydown.backspace="onTagBackspace"
              />
            </div>
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Appuyez sur Entrée pour ajouter un tag</p>
          </div>

        </div>
      </div>

      <!-- Colonne latérale -->
      <div class="space-y-6">

        <!-- Upload image de couverture -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h4 class="font-bold text-sm text-slate-800 mb-4">Image de couverture</h4>
          <div
            class="relative group cursor-pointer aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 hover:border-primary transition-colors overflow-hidden"
            @click="triggerFileInput"
          >
            <img
              v-if="form.coverImagePreview"
              :src="form.coverImagePreview"
              alt="Aperçu"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div v-else class="text-center p-4">
              <ImagePlus :size="30" class="text-primary mx-auto mb-2" />
              <p class="text-xs font-bold text-slate-600">Uploader une image</p>
              <p class="text-[10px] text-slate-400 mt-1">Recommandé : 1280×720px (16:9)</p>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageUpload"
            />
          </div>
          <button
            v-if="form.coverImagePreview"
            type="button"
            class="mt-3 w-full text-xs text-slate-400 hover:text-red-500 font-medium transition-colors flex items-center justify-center gap-1"
            @click="removeCoverImage"
          >
            <X :size="12" /> Supprimer l'image
          </button>
        </div>

        <!-- Conseils formateur -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div class="flex items-center gap-2.5 mb-4">
            <Lightbulb :size="18" class="text-yellow-500" />
            <h4 class="font-bold text-sm text-slate-800">Conseils formateur</h4>
          </div>
          <ul class="space-y-3">
            <li v-for="tip in instructorTips" :key="tip" class="flex gap-2">
              <CheckCircle2 :size="14" class="text-primary mt-0.5 shrink-0" />
              <p class="text-xs text-slate-400">{{ tip }}</p>
            </li>
          </ul>
        </div>

        <!-- Aperçu de la carte cours -->
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div class="bg-primary/10 px-4 py-3 border-b border-slate-200">
            <p class="text-[10px] font-black uppercase text-primary tracking-widest">Aperçu de la carte</p>
          </div>
          <div class="p-4">
            <div class="bg-slate-100 aspect-video rounded-lg mb-3 flex items-center justify-center overflow-hidden">
              <img
                v-if="form.coverImagePreview"
                :src="form.coverImagePreview"
                alt="preview"
                class="w-full h-full object-cover"
              />
              <ImageIcon v-else :size="28" class="text-slate-300" />
            </div>
            <div
              class="text-sm font-bold mb-1 line-clamp-2 leading-tight text-slate-800 transition-all"
              :class="form.title ? 'opacity-100' : 'opacity-0 h-4 bg-slate-100 rounded w-3/4'"
            >
              {{ form.title || '&nbsp;' }}
            </div>
            <div class="h-3 w-1/2 bg-slate-100 rounded mb-4 opacity-60" />
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="size-6 bg-slate-100 rounded-full" />
                <div class="h-2 w-14 bg-slate-100 rounded" />
              </div>
              <div class="h-4 w-10 bg-primary/20 rounded" />
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Actions bas de page -->
    <p v-if="error" class="mt-6 text-sm text-red-500 font-medium text-right">{{ error }}</p>
    <div class="mt-3 flex justify-between items-center pt-6 border-t border-slate-200">
      <button
        type="button"
        class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors"
        @click="handleDiscard"
      >
        <X :size="14" />
        Abandonner
      </button>
      <div class="flex gap-3">
        <button
          type="button"
          class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold bg-white hover:bg-slate-50 transition-colors disabled:opacity-60"
          :disabled="saving"
          @click="handleSaveDraft"
        >
          Enregistrer comme brouillon
        </button>
        <button
          type="button"
          class="px-7 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          :disabled="saving"
          @click="handleSaveAndContinue"
        >
          {{ saving ? 'Sauvegarde…' : 'Étape suivante : Programme' }}
          <ChevronRight :size="15" />
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import {
  ChevronRight,
  X,
  Gauge,
  TrendingUp,
  Zap,
  ImagePlus,
  Image as ImageIcon,
  Lightbulb,
  CheckCircle2,
} from 'lucide-vue-next'
import { COURSE_STEPS } from '~/utils/courseSteps'

const localePath = useLocalePath()

const difficultyOptions = [
  { value: 'beginner', label: 'Débutant', icon: Gauge },
  { value: 'intermediate', label: 'Intermédiaire', icon: TrendingUp },
  { value: 'advanced', label: 'Avancé', icon: Zap },
]

const instructorTips = [
  'Gardez votre titre sous 60 caractères pour un meilleur affichage sur mobile.',
  'Ajoutez au moins 5 mots-clés pour améliorer votre visibilité dans les recherches.',
  "Une image de couverture soignée peut augmenter les inscriptions de 30 %.",
]

const form = reactive({
  title: '',
  categoryId: null,
  subCategoryId: null,
  difficulty: 'beginner',
  description: '',
  tags: [],
  coverImage: null,
  coverImagePreview: null,
})

const { data: categories } = await useFetch('/api/categories')

const subcategories = computed(() =>
  categories.value?.find(c => c.id === form.categoryId)?.children ?? []
)

watch(() => form.categoryId, () => { form.subCategoryId = null })

const creation = useCourseCreation()
const saving = ref(false)
const error = ref('')
const newTag = ref('')
const fileInput = ref(null)

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
  }
  newTag.value = ''
}

function removeTag(index) {
  form.tags.splice(index, 1)
}

function onTagBackspace() {
  if (newTag.value === '' && form.tags.length > 0) {
    form.tags.pop()
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  if (form.coverImagePreview) URL.revokeObjectURL(form.coverImagePreview)
  form.coverImage = file
  form.coverImagePreview = URL.createObjectURL(file)
}

function removeCoverImage() {
  if (form.coverImagePreview) URL.revokeObjectURL(form.coverImagePreview)
  form.coverImage = null
  form.coverImagePreview = null
  if (fileInput.value) fileInput.value.value = ''
}

async function buildPayload() {
  let coverImage = null
  if (form.coverImage) {
    const fd = new FormData()
    fd.append('file', form.coverImage)
    const result = await creation.uploadFile(form.coverImage)
    coverImage = result.url
  }
  return {
    title: form.title,
    description: form.description || null,
    categoryId: form.categoryId || null,
    subCategoryId: form.subCategoryId || null,
    difficulty: form.difficulty,
    tags: form.tags,
    coverImage,
  }
}

async function handleSaveAndContinue() {
  error.value = ''
  if (!form.title.trim()) {
    error.value = 'Le titre du cours est requis.'
    return
  }
  saving.value = true
  try {
    const course = await creation.createCourse(await buildPayload())
    navigateTo(localePath(`/instructor/courses/${course.slug}/curriculum`))
  } catch (e) {
    error.value = 'Une erreur est survenue lors de la sauvegarde. Vérifiez la console.'
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function handleSaveDraft() {
  error.value = ''
  if (!form.title.trim()) {
    error.value = 'Le titre du cours est requis.'
    return
  }
  saving.value = true
  try {
    await creation.createCourse(await buildPayload())
    navigateTo(localePath('/courses'))
  } catch (e) {
    error.value = 'Une erreur est survenue lors de la sauvegarde. Vérifiez la console.'
    console.error(e)
  } finally {
    saving.value = false
  }
}

function handleDiscard() {
  navigateTo(localePath('/courses'))
}

onBeforeUnmount(() => {
  if (form.coverImagePreview) URL.revokeObjectURL(form.coverImagePreview)
})
</script>
