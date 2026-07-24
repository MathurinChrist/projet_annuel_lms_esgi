<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Dashboard</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">Conférences</span>
        </nav>
        <h1 class="text-3xl font-black tracking-tight">Conférences</h1>
        <p class="text-slate-400 text-sm mt-1">Rejoignez les sessions en direct de vos formateurs.</p>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
        <div class="h-36 bg-slate-100" />
        <div class="p-5 space-y-3">
          <div class="h-4 bg-slate-100 rounded w-3/4" />
          <div class="h-3 bg-slate-100 rounded w-1/2" />
          <div class="h-9 bg-slate-100 rounded-xl mt-4" />
        </div>
      </div>
    </div>

    <!-- Liste -->
    <div v-else-if="conferences.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="conf in conferences"
        :key="conf.id"
        class="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col"
      >
        <!-- Header visuel -->
        <div class="relative h-36 overflow-hidden" :class="gradient(conf.id)">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <!-- Badge statut -->
          <div class="absolute top-4 right-4">
            <span
              v-if="conf.status === 'LIVE'"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-widest shadow-sm"
            >
              <span class="size-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
            <span
              v-else
              class="px-2.5 py-1 rounded-lg bg-white/90 text-slate-600 text-[10px] font-bold uppercase tracking-widest shadow-sm"
            >
              À venir
            </span>
          </div>

          <!-- Infos bas du header -->
          <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
            <div class="flex items-center gap-1.5 text-xs font-medium">
              <Calendar :size="12" />
              <span>{{ formatDateShort(conf.scheduledAt) }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs font-medium">
              <Users :size="12" />
              <span>{{ conf._count.registrations }}</span>
            </div>
          </div>
        </div>

        <!-- Contenu -->
        <div class="p-5 flex-1 flex flex-col">
          <h3 class="text-base font-bold line-clamp-2 group-hover:text-primary transition-colors mb-1">
            {{ conf.title }}
          </h3>
          <p v-if="conf.description" class="text-xs text-slate-400 line-clamp-2 mb-2">{{ conf.description }}</p>
          <p class="text-[11px] text-slate-400">
            Par {{ conf.author?.firstName }} {{ conf.author?.lastName }}
          </p>

          <div class="mt-auto pt-4 border-t border-slate-100">
            <NuxtLink
              v-if="conf.status === 'LIVE'"
              :to="localePath(`/conferences/${conf.roomName}`)"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
            >
              <Video :size="15" />
              Rejoindre maintenant
            </NuxtLink>

            <div v-else class="flex items-center gap-2">
              <button
                v-if="!conf.isRegistered"
                class="flex-1 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors"
                @click="register(conf)"
              >
                S'inscrire
              </button>
              <button
                v-else
                class="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
                @click="unregister(conf)"
              >
                Inscrit · Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vide -->
    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <div class="size-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
        <Video :size="28" class="text-primary" />
      </div>
      <h3 class="font-bold text-slate-700 mb-1">Aucune conférence prévue</h3>
      <p class="text-sm text-slate-400">Les prochaines sessions apparaîtront ici.</p>
    </div>
  </div>
</template>

<script setup>
import { ChevronRight, Calendar, Users, Video } from 'lucide-vue-next'

const localePath = useLocalePath()
const token = useCookie('token')

const pending = ref(true)
const conferences = ref([])

const GRADIENTS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-violet-500 to-purple-700',
  'bg-gradient-to-br from-sky-400 to-blue-600',
  'bg-gradient-to-br from-emerald-400 to-teal-600',
  'bg-gradient-to-br from-orange-400 to-rose-500',
  'bg-gradient-to-br from-pink-400 to-fuchsia-600',
]

function gradient(id) {
  return GRADIENTS[id % GRADIENTS.length]
}

onMounted(async () => {
  try {
    conferences.value = await $fetch('/api/conferences', {
      headers: { Authorization: `Bearer ${token.value}` },
    })
  } finally {
    pending.value = false
  }
})

async function register(conf) {
  try {
    await $fetch(`/api/conferences/${conf.id}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
    })
    conf.isRegistered = true
    conf._count.registrations++
  } catch {}
}

async function unregister(conf) {
  try {
    await $fetch(`/api/conferences/${conf.id}/register`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
    })
    conf.isRegistered = false
    conf._count.registrations--
  } catch {}
}

function formatDateShort(date) {
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
