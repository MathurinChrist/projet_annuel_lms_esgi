<template>
  <div>
    <div class="flex items-start justify-between mb-8">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Dashboard</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <NuxtLink :to="localePath('/instructor/conferences')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Mes conférences</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">Nouvelle conférence</span>
        </nav>
        <h1 class="text-2xl font-black tracking-tight text-slate-900">Nouvelle conférence</h1>
        <p class="text-slate-400 text-sm mt-1">Planifiez une session en direct pour vos apprenants.</p>
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
          :disabled="saving"
          @click="save"
        >
          <Save :size="15" />
          {{ saving ? 'Création...' : 'Créer la conférence' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Formulaire principal -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Titre <span class="text-red-400">*</span></label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Ex: Introduction à Vue.js - Session live"
              class="w-full h-12 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-slate-800">Description</label>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Décrivez le contenu et les objectifs de cette session..."
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

      <!-- Colonne latérale -->
      <div class="space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Info :size="16" class="text-primary" />
            Informations
          </h3>
          <ul class="space-y-2 text-xs text-slate-500">
            <li class="flex items-start gap-2">
              <span class="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              Un lien unique est généré automatiquement à la création.
            </li>
            <li class="flex items-start gap-2">
              <span class="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              Les apprenants peuvent s'inscrire en avance depuis la liste des conférences.
            </li>
            <li class="flex items-start gap-2">
              <span class="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              Démarrez la session depuis votre liste quand vous êtes prêt.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronRight, X, Save, Info } from 'lucide-vue-next'

const localePath = useLocalePath()
const router = useRouter()
const token = useCookie('token')

const saving = ref(false)
const error = ref('')
const form = reactive({
  title: '',
  description: '',
  scheduledAt: '',
})

async function save() {
  if (!form.title || !form.scheduledAt) {
    error.value = 'Le titre et la date sont requis.'
    return
  }
  error.value = ''
  saving.value = true
  try {
    await $fetch('/api/instructor/conferences', {
      method: 'POST',
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
</script>
