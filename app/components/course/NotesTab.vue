<template>
  <div>
    <div v-if="!enrolled" class="py-16 text-center text-slate-400">
      <Lock :size="32" class="mx-auto mb-3 text-slate-300" />
      <p class="text-sm font-medium">{{ $t('notes.locked_course_tab') }}</p>
    </div>

    <template v-else>
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-slate-500">{{ $t('notes.card.count', { count: notes.length }) }}</p>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors"
          @click="openCreate"
        >
          <Plus :size="14" />
          {{ $t('notes.new') }}
        </button>
      </div>

      <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="h-32 rounded-xl bg-slate-100 animate-pulse" />
      </div>

      <div v-else-if="!notes.length" class="py-12 text-center text-slate-400 text-sm">
        {{ $t('notes.empty_state.course') }}
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NotesNoteCard
          v-for="note in notes"
          :key="note.id"
          :note="note"
          @open="openEdit(note)"
          @delete="removeNote(note)"
        />
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
        context="course"
        :locked-course-id="course.id"
        :locked-course="course"
        :saving="saving"
        @save="handleSave"
        @cancel="closeEditor"
      />
    </UiModal>
  </div>
</template>

<script setup>
import { Lock, Plus } from 'lucide-vue-next'

const props = defineProps({
  course: { type: Object, required: true },
  enrolled: { type: Boolean, default: false },
})

const notesApi = useNotes()

const notes = ref([])
const pending = ref(true)

async function load() {
  if (!props.enrolled) return
  pending.value = true
  try {
    const data = await notesApi.listNotes({ courseId: props.course.id, limit: 50 })
    notes.value = data.notes
  } catch {
    notes.value = []
  } finally {
    pending.value = false
  }
}

watch(() => props.enrolled, load, { immediate: true })

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

const { t } = useI18n()
async function removeNote(note) {
  if (!confirm(t('notes.confirm_delete'))) return
  await notesApi.deleteNote(note.id)
  await load()
}
</script>
