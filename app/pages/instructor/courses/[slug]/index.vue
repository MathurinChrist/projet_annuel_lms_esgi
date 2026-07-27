<template>
  <div>
    <div class="flex items-start justify-between mb-2">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">
            {{ $t('nav.dashboard') }}
          </NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <NuxtLink :to="localePath('/courses')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">
            {{ $t('instructor.courses_title') }}
          </NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">{{ $t('instructor.step1') }}</span>
        </nav>
        <h1 class="text-2xl font-black tracking-tight text-slate-900">{{ $t('instructor.general_info') }}</h1>
        <p class="text-slate-400 text-sm mt-1">{{ $t('instructor.general_info_hint') }}</p>
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
          :disabled="saving || loading"
          @click="handleSaveAndContinue"
        >
          {{ saving ? $t('common.saving') : $t('instructor.save_continue') }}
          <ChevronRight :size="15" />
        </button>
      </div>
    </div>

    <InstructorCourseCreationStepper :current-step="1" :steps="COURSE_STEPS" />

    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div class="h-12 bg-slate-100 rounded-lg" />
          <div class="grid grid-cols-2 gap-5">
            <div class="h-12 bg-slate-100 rounded-lg" />
            <div class="h-12 bg-slate-100 rounded-lg" />
          </div>
          <div class="h-48 bg-slate-100 rounded-lg" />
        </div>
      </div>
      <div class="space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-6 h-48 bg-slate-100" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Titre du cours</label>
            <input
              v-model="form.title"
              type="text"
              class="w-full h-12 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
              :placeholder="$t('instructor.placeholders.title')"
            />
            <p class="text-xs text-slate-400">{{ $t('instructor.title_hint') }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.category') }}</label>
              <select
                v-model="form.categoryId"
                class="w-full h-12 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all cursor-pointer"
              >
                <option :value="null">{{ $t('instructor.select_category') }}</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.subcategory') }}</label>
              <select
                v-model="form.subCategoryId"
                :disabled="!subcategories.length"
                class="w-full h-12 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option :value="null">{{ subcategories.length ? $t('instructor.select_subcategory') : $t('instructor.choose_category_first') }}</option>
                <option v-for="sub in subcategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.difficulty_level') }}</label>
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

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Description</label>
            <UiRichTextEditor
              v-model="form.description"
              :placeholder="$t('instructor.placeholders.description')"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">{{ $t('instructor.keywords') }}</label>
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
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{{ $t('instructor.press_enter_tag') }}</p>
          </div>

        </div>
      </div>

      <div class="space-y-6">

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
              <p class="text-[10px] text-slate-400 mt-1">{{ $t('instructor.cover_hint') }}</p>
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

        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div class="bg-primary/10 px-4 py-3 border-b border-slate-200">
            <p class="text-[10px] font-black uppercase text-primary tracking-widest">{{ $t('instructor.card_preview') }}</p>
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

    <p v-if="error" class="mt-6 text-sm text-red-500 font-medium text-right">{{ error }}</p>
    <div class="mt-3 flex justify-between items-center pt-6 border-t border-slate-200">
      <button
        v-if="courseStatus === 'DRAFT'"
        type="button"
        class="px-5 py-2.5 rounded-lg border border-red-200 text-sm font-bold text-red-500 flex items-center gap-2 hover:bg-red-50 transition-colors"
        @click="handleAbandonDraft"
      >
        <Trash2 :size="14" />
        {{ $t('instructor.discard_draft') }}
      </button>
      <NuxtLink
        v-else
        :to="localePath('/courses')"
        class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors"
      >
        <X :size="14" />
        Quitter
      </NuxtLink>
      <div class="flex gap-3">
        <button
          type="button"
          class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold bg-white hover:bg-slate-50 transition-colors disabled:opacity-60"
          :disabled="saving || loading"
          @click="handleSave"
        >
          Enregistrer
        </button>
        <button
          type="button"
          class="px-7 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          :disabled="saving || loading"
          @click="handleSaveAndContinue"
        >
          {{ saving ? $t('common.saving') : $t('instructor.next_curriculum') }}
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
  Trash2,
  Gauge,
  TrendingUp,
  Zap,
  ImagePlus,
  Image as ImageIcon,
  Lightbulb,
  CheckCircle2,
} from 'lucide-vue-next'
import { COURSE_STEPS } from '~/utils/courseSteps'

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const creation = useCourseCreation()

const slug = route.params.slug

const difficultyOptions = computed(() => [
  { value: 'beginner', label: t('catalog.difficulty_beginner'), icon: Gauge },
  { value: 'intermediate', label: t('catalog.difficulty_intermediate'), icon: TrendingUp },
  { value: 'advanced', label: t('catalog.difficulty_advanced'), icon: Zap },
])

const instructorTips = computed(() => [
  t('instructor.tips.title_length'),
  t('instructor.tips.keywords'),
  t('instructor.tips.cover'),
])

const courseId = ref(null)
const courseStatus = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const newTag = ref('')
const fileInput = ref(null)

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

onMounted(async () => {
  try {
    const course = await creation.getCourse(slug)
    courseId.value = course.id
    courseStatus.value = course.status
    form.title = course.title ?? ''
    form.categoryId = course.categoryId ?? null
    form.subCategoryId = course.subCategoryId ?? null
    form.difficulty = (course.difficulty ?? 'BEGINNER').toLowerCase()
    form.description = course.description ?? ''
    form.tags = course.tags ?? []
    if (course.coverImage) {
      form.coverImagePreview = course.coverImage
    }
  } catch {
    navigateTo(localePath('/courses'))
  } finally {
    loading.value = false
  }
  watch(() => form.categoryId, () => { form.subCategoryId = null })
})

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) form.tags.push(tag)
  newTag.value = ''
}

function removeTag(index) {
  form.tags.splice(index, 1)
}

function onTagBackspace() {
  if (newTag.value === '' && form.tags.length > 0) form.tags.pop()
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  if (form.coverImage) URL.revokeObjectURL(form.coverImagePreview)
  form.coverImage = file
  form.coverImagePreview = URL.createObjectURL(file)
}

function removeCoverImage() {
  if (form.coverImage) URL.revokeObjectURL(form.coverImagePreview)
  form.coverImage = null
  form.coverImagePreview = null
  if (fileInput.value) fileInput.value.value = ''
}

async function buildPayload() {
  let coverImage = form.coverImagePreview  // URL existante par défaut

  if (form.coverImage) {
    const fd = new FormData()
    fd.append('file', form.coverImage)
    const result = await creation.uploadFile(form.coverImage)
    coverImage = result.url
  } else if (!form.coverImagePreview) {
    coverImage = null
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

async function handleSave() {
  error.value = ''
  if (!form.title.trim()) {
    error.value = 'Le titre du cours est requis.'
    return
  }
  saving.value = true
  try {
    await creation.updateCourse(courseId.value, await buildPayload())
  } catch (e) {
    error.value = t('instructor.save_error')
    console.error(e)
  } finally {
    saving.value = false
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
    await creation.updateCourse(courseId.value, await buildPayload())
    navigateTo(localePath(`/instructor/courses/${slug}/curriculum`))
  } catch (e) {
    error.value = t('instructor.save_error')
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function handleAbandonDraft() {
  if (!confirm(t('common.confirm_delete_draft'))) return
  try {
    await creation.deleteCourse(courseId.value)
    navigateTo(localePath('/courses'))
  } catch {
    error.value = 'Erreur lors de la suppression du brouillon.'
  }
}

onBeforeUnmount(() => {
  if (form.coverImage) URL.revokeObjectURL(form.coverImagePreview)
})
</script>
