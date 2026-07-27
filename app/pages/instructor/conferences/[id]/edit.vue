<template>
  <div>
    <div class="flex items-start justify-between mb-8">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">{{ $t('nav.dashboard') }}</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <NuxtLink :to="localePath('/instructor/conferences')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Mes conférences</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">Modifier</span>
        </nav>
        <h1 class="text-2xl font-black tracking-tight text-slate-900">Modifier la conférence</h1>
        <p v-if="conference" class="text-slate-400 text-sm mt-1">{{ conference.title }}</p>
      </div>

      <div class="flex items-center gap-3 mt-1 shrink-0">
        <NuxtLink
          :to="localePath('/instructor/conferences')"
          class="flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <X :size="15" />
          Annuler
        </NuxtLink>
        <button
          class="flex items-center gap-2 px-5 h-10 rounded-lg bg-primary text-white text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-60"
          :disabled="saving || loading"
          @click="save"
        >
          <Save :size="15" />
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 animate-pulse">
        <div class="h-12 bg-slate-100 rounded-lg" />
        <div class="h-24 bg-slate-100 rounded-lg" />
        <div class="h-12 bg-slate-100 rounded-lg" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Titre <span class="text-red-400">*</span></label>
            <input
              v-model="form.title"
              type="text"
              :placeholder="$t('instructor.placeholders.conference_title')"
              class="w-full h-12 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Description</label>
            <textarea
              v-model="form.description"
              rows="4"
              :placeholder="$t('instructor.placeholders.conference_desc')"
              class="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all resize-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Date et heure <span class="text-red-400">*</span></label>
            <input
              v-model="form.scheduledAt"
              type="datetime-local"
              class="w-full h-12 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
          </div>

          <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <h3 class="text-sm font-bold text-slate-800">Détails</h3>
          <div class="text-xs text-slate-500 space-y-2">
            <div class="flex justify-between">
              <span>Statut</span>
              <span
                class="font-bold"
                :class="{
                  'text-red-500': conference?.status === 'LIVE',
                  'text-slate-600': conference?.status === 'PENDING',
                  'text-green-600': conference?.status === 'ENDED',
                }"
              >
                {{ statusLabel(conference?.status) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Inscrits</span>
              <span class="font-bold">{{ conference?._count?.registrations ?? 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronRight, X, Save } from 'lucide-vue-next'

const localePath = useLocalePath()
const router = useRouter()
const route = useRoute()
const token = useCookie('token')

const id = route.params.id
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const conference = ref(null)

const form = reactive({
  title: '',
  description: '',
  scheduledAt: '',
})

onMounted(async () => {
  try {
    const conferences = await $fetch('/api/instructor/conferences', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    const found = conferences.find((c) => String(c.id) === String(id))
    if (!found) return router.push(localePath('/instructor/conferences'))
    conference.value = found
    form.title = found.title
    form.description = found.description || ''
    form.scheduledAt = toLocalDatetimeInput(found.scheduledAt)
  } catch {
    router.push(localePath('/instructor/conferences'))
  } finally {
    loading.value = false
  }
})

function toLocalDatetimeInput(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function save() {
  if (!form.title || !form.scheduledAt) {
    error.value = 'Le titre et la date sont requis.'
    return
  }
  error.value = ''
  saving.value = true
  try {
    await $fetch(`/api/instructor/conferences/${id}`, {
      method: 'PUT',
      body: { title: form.title, description: form.description, scheduledAt: form.scheduledAt },
      headers: { Authorization: `Bearer ${token.value}` },
    })
    router.push(localePath('/instructor/conferences'))
  } catch (e) {
    error.value = e.data?.statusMessage || 'Une erreur est survenue.'
  } finally {
    saving.value = false
  }
}

function statusLabel(status) {
  if (status === 'LIVE') return 'En cours'
  if (status === 'ENDED') return 'Terminée'
  return 'Planifiée'
}
</script>
