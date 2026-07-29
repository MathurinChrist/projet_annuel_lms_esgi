<template>
  <div class="space-y-6">
    <div class="rounded-3xl bg-gradient-to-br from-[#0A66C2] to-[#004182] p-5 sm:p-7 md:p-8 text-white shadow-xl shadow-blue-200/30 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">{{ $t('notes.brand') }}</p>
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight mt-2">{{ $t('notes.title') }}</h1>
        <p class="text-blue-100 text-sm mt-2 max-w-2xl">{{ $t('notes.subtitle') }}</p>
      </div>
      <button
        type="button"
        class="h-11 px-5 rounded-full bg-white text-[#0A66C2] text-sm font-bold hover:bg-blue-50 transition-colors shrink-0 inline-flex items-center justify-center gap-2"
        @click="openCreate"
      >
        <Plus :size="16" />
        {{ $t('notes.new') }}
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          v-model="filters.search"
          type="text"
          class="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          :placeholder="$t('notes.filters.search_placeholder')"
          @input="onSearchInput"
        />
      </div>

      <select
        v-model="courseFilter"
        class="h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        @change="reload"
      >
        <option :value="null">{{ $t('notes.filters.course') }}</option>
        <option v-for="c in courseOptions" :key="c.id" :value="c.id">{{ c.title }}</option>
      </select>

      <select
        v-model="filters.tag"
        class="h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        @change="reload"
      >
        <option value="">{{ $t('notes.filters.tag') }}</option>
        <option v-for="t in tagOptions" :key="t" :value="t">{{ t }}</option>
      </select>

      <input
        v-model="filters.dateFrom"
        type="date"
        class="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        @change="reload"
      />
      <input
        v-model="filters.dateTo"
        type="date"
        class="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        @change="reload"
      />

      <label class="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer select-none">
        <input v-model="filters.unattached" type="checkbox" class="accent-primary" @change="reload" />
        {{ $t('notes.filters.unattached') }}
      </label>
    </div>

    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-36 rounded-xl bg-slate-100 animate-pulse" />
    </div>

    <div v-else-if="!notes.length" class="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
      <div class="size-14 rounded-2xl bg-[#E8F3FF] text-[#0A66C2] flex items-center justify-center mx-auto mb-4">
        <NotebookPen :size="26" />
      </div>
      <h3 class="font-bold text-slate-800">{{ $t('notes.empty_state.global') }}</h3>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NotesNoteCard
          v-for="note in notes"
          :key="note.id"
          :note="note"
          @open="openEdit(note)"
          @delete="removeNote(note)"
        />
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          class="h-9 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          :disabled="page <= 1"
          @click="page--; load()"
        >
          {{ $t('common.previous') }}
        </button>
        <span class="text-sm text-slate-500">{{ page }} / {{ totalPages }}</span>
        <button
          type="button"
          class="h-9 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          :disabled="page >= totalPages"
          @click="page++; load()"
        >
          {{ $t('common.next') }}
        </button>
      </div>
    </template>

    <UiModal
      :open="editorOpen"
      :title="editingNote ? $t('notes.editor.edit_title') : $t('notes.editor.new_title')"
      size="lg"
      @close="closeEditor"
    >
      <NotesNoteEditor
        v-if="editorOpen"
        :note="editingNote"
        context="free"
        :saving="saving"
        @save="handleSave"
        @cancel="closeEditor"
      />
    </UiModal>
  </div>
</template>

<script setup>
import { Plus, Search, NotebookPen } from 'lucide-vue-next'

const { t } = useI18n()
const notesApi = useNotes()
const student = useStudentCourse()

const notes = ref([])
const total = ref(0)
const page = ref(1)
const limit = 12
const pending = ref(true)

const filters = reactive({
  search: '',
  tag: '',
  dateFrom: '',
  dateTo: '',
  unattached: false,
})
const courseFilter = ref(null)

const courseOptions = ref([])
const tagOptions = computed(() => {
  const set = new Set()
  for (const n of notes.value) for (const t of n.tags || []) set.add(t)
  return [...set].sort()
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

async function load() {
  pending.value = true
  try {
    const data = await notesApi.listNotes({
      courseId: courseFilter.value || undefined,
      tag: filters.tag || undefined,
      unattached: filters.unattached || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      search: filters.search || undefined,
      page: page.value,
      limit,
    })
    notes.value = data.notes
    total.value = data.total
  } catch {
    notes.value = []
    total.value = 0
  } finally {
    pending.value = false
  }
}

function reload() {
  page.value = 1
  load()
}

let debounceTimer = null
function onSearchInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(reload, 350)
}

onMounted(async () => {
  load()
  try {
    const enrollments = await student.getEnrollments()
    courseOptions.value = enrollments.map(e => e.course)
  } catch {
    courseOptions.value = []
  }
})

const editorOpen = ref(false)
const editingNote = ref(null)
const saving = ref(false)

function openCreate() {
  editingNote.value = null
  editorOpen.value = true
}

function openEdit(note) {
  editingNote.value = note
  editorOpen.value = true
}

function closeEditor() {
  editorOpen.value = false
  editingNote.value = null
}

async function handleSave(payload) {
  saving.value = true
  try {
    if (editingNote.value) {
      await notesApi.updateNote(editingNote.value.id, payload)
    } else {
      await notesApi.createNote(payload)
    }
    closeEditor()
    await load()
  } finally {
    saving.value = false
  }
}

async function removeNote(note) {
  if (!confirm(t('notes.confirm_delete'))) return
  await notesApi.deleteNote(note.id)
  await load()
}
</script>
