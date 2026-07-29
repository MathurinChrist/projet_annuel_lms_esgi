<template>
  <div class="space-y-4">
    <template v-if="view === 'list'">
      <button
        type="button"
        class="w-full inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-lg bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors"
        @click="openCreate"
      >
        <Plus :size="13" />
        {{ $t('notes.new') }}
      </button>

      <div v-if="pending" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-24 rounded-xl bg-slate-100 animate-pulse" />
      </div>

      <template v-else>
        <!-- Notes de la leçon en cours -->
        <section class="space-y-2">
          <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {{ $t('notes.lesson_panel.this_lesson') }}
          </h4>
          <p v-if="!lessonNotes.length" class="text-sm text-slate-400 py-2">
            {{ $t('notes.empty_state.lesson') }}
          </p>
          <div v-else class="space-y-3">
            <NotesNoteCard
              v-for="note in lessonNotes"
              :key="note.id"
              :note="note"
              @open="openEdit(note)"
              @delete="removeNote(note)"
            />
          </div>
        </section>

        <!-- Notes rattachées au cours entier : visibles depuis chaque leçon. -->
        <section v-if="courseWideNotes.length" class="space-y-2 pt-2 border-t border-slate-100">
          <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-2">
            {{ $t('notes.lesson_panel.course_notes') }}
          </h4>
          <div class="space-y-3">
            <NotesNoteCard
              v-for="note in courseWideNotes"
              :key="note.id"
              :note="note"
              @open="openEdit(note)"
              @delete="removeNote(note)"
            />
          </div>
        </section>
      </template>
    </template>

    <template v-else>
      <div class="flex items-center gap-2 mb-1">
        <button type="button" class="p-1 -ml-1 text-slate-400 hover:text-slate-700 transition-colors" @click="view = 'list'">
          <ArrowLeft :size="16" />
        </button>
        <h3 class="font-bold text-sm text-slate-900">
          {{ editingNote ? $t('notes.editor.edit_title') : $t('notes.editor.new_title') }}
        </h3>
      </div>
      <NotesNoteEditor
        :note="editingNote"
        context="lesson"
        :locked-course-id="courseId"
        :locked-lesson-id="lessonId"
        :locked-course="{ id: courseId, title: courseTitle }"
        :locked-lesson="{ id: lessonId, title: lessonTitle }"
        min-height="160px"
        :saving="saving"
        @save="handleSave"
        @cancel="view = 'list'"
      />
    </template>
  </div>
</template>

<script setup>
import { Plus, ArrowLeft } from 'lucide-vue-next'

const props = defineProps({
  lessonId: { type: Number, required: true },
  courseId: { type: Number, required: true },
  courseTitle: { type: String, default: '' },
  lessonTitle: { type: String, default: '' },
})

const { t } = useI18n()
const notesApi = useNotes()

const notes = ref([])
const pending = ref(true)
const view = ref('list')
const editingNote = ref(null)
const saving = ref(false)

/**
 * On charge toutes les notes du cours (et pas seulement celles de la leçon) pour
 * pouvoir afficher, sous les notes de la leçon en cours, les autres notes du
 * cours — sinon le panneau paraît vide alors que l'étudiant a des notes.
 */
async function load() {
  pending.value = true
  try {
    const data = await notesApi.listNotes({ courseId: props.courseId, limit: 50 })
    notes.value = data.notes
  } catch {
    notes.value = []
  } finally {
    pending.value = false
  }
}

// Note rattachée à une leçon → visible uniquement dans cette leçon.
const lessonNotes = computed(() => notes.value.filter(n => n.lessonId === props.lessonId))
// Note rattachée au cours entier → visible dans toutes les leçons du cours.
const courseWideNotes = computed(() => notes.value.filter(n => n.lessonId == null))

watch(() => props.lessonId, () => {
  view.value = 'list'
  editingNote.value = null
  load()
}, { immediate: true })

function openCreate() {
  editingNote.value = null
  view.value = 'editor'
}

function openEdit(note) {
  editingNote.value = note
  view.value = 'editor'
}

async function handleSave(payload) {
  saving.value = true
  try {
    if (editingNote.value) {
      await notesApi.updateNote(editingNote.value.id, payload)
    } else {
      await notesApi.createNote(payload)
    }
    view.value = 'list'
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
