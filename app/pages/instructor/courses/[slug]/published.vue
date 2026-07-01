<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden">

    <!-- Confettis décoratifs -->
    <div class="absolute top-8  left-1/4  size-3 bg-yellow-400 rounded-full opacity-40" />
    <div class="absolute top-16 right-1/3 size-4 bg-primary rotate-45 opacity-30" />
    <div class="absolute top-32 left-1/3  size-2 bg-green-400 rounded-full opacity-50" />
    <div class="absolute top-8  right-1/4 size-3 bg-red-400 rounded opacity-40" />
    <div class="absolute top-24 left-1/5  size-2 bg-primary rounded-full opacity-25" />
    <div class="absolute top-40 right-1/5 size-3 bg-yellow-300 rotate-12 opacity-35" />

    <!-- Icône animée -->
    <div class="mb-8 relative">
      <div class="size-24 bg-green-500/10 rounded-full flex items-center justify-center animate-bounce">
        <Sparkles :size="52" class="text-green-500" />
      </div>
    </div>

    <!-- Titre -->
    <h1 class="text-4xl font-black tracking-tight text-center mb-4">Votre cours est en ligne !</h1>
    <p class="text-lg text-slate-400 text-center mb-10 max-w-xl">
      Félicitations ! <strong class="text-slate-700">« {{ course?.title }} »</strong> a été publié avec succès et est maintenant accessible aux apprenants.
    </p>

    <!-- Actions rapides -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
      <NuxtLink
        :to="localePath('/')"
        class="bg-white border border-slate-200 rounded-xl p-6 hover:border-primary transition-colors text-center group"
      >
        <LayoutDashboard :size="28" class="text-primary mx-auto mb-3" />
        <h3 class="font-bold text-sm mb-1">Tableau de bord</h3>
        <p class="text-xs text-slate-400">Gérer mes inscriptions</p>
      </NuxtLink>
      <NuxtLink
        :to="localePath('/instructor/courses/create')"
        class="bg-white border border-slate-200 rounded-xl p-6 hover:border-primary transition-colors text-center group"
      >
        <PlusCircle :size="28" class="text-primary mx-auto mb-3" />
        <h3 class="font-bold text-sm mb-1">Nouveau cours</h3>
        <p class="text-xs text-slate-400">Créer un autre cours</p>
      </NuxtLink>
      <NuxtLink
        :to="localePath('/courses')"
        class="bg-white border border-slate-200 rounded-xl p-6 hover:border-primary transition-colors text-center group"
      >
        <BookOpen :size="28" class="text-primary mx-auto mb-3" />
        <h3 class="font-bold text-sm mb-1">Mes cours</h3>
        <p class="text-xs text-slate-400">Voir tous mes cours</p>
      </NuxtLink>
    </div>

    <!-- Partage -->
    <div class="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <h2 class="text-lg font-bold mb-6">Partager votre cours</h2>

      <!-- Lien -->
      <div class="flex flex-col gap-2 mb-6">
        <label class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Lien de partage</label>
        <div class="flex gap-2">
          <div class="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between overflow-hidden">
            <span class="text-sm text-slate-400 truncate">{{ shareUrl }}</span>
            <button class="ml-2 shrink-0 hover:scale-110 transition-transform" @click="copyLink">
              <component :is="copied ? Check : Copy" :size="18" :class="copied ? 'text-green-500' : 'text-primary'" />
            </button>
          </div>
          <button
            class="bg-primary text-white px-5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
            @click="copyLink"
          >
            {{ copied ? 'Copié !' : 'Copier' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Note bas de page -->
    <div class="flex items-center gap-2 text-slate-400 mt-10">
      <Info :size="14" />
      <p class="text-xs">La recherche globale peut mettre quelques minutes à indexer votre cours.</p>
    </div>

  </div>
</template>

<script setup>
import {
  Sparkles,
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Copy,
  Check,
  Info,
} from 'lucide-vue-next'

const route = useRoute()
const localePath = useLocalePath()

const slug = route.params.slug

const course = ref(null)
const copied = ref(false)

const shareUrl = computed(() => {
  if (!import.meta.client) return ''
  return `${window.location.origin}/courses/${slug}`
})

onMounted(async () => {
  try {
    const data = await $fetch(`/api/instructor/courses/${slug}`)
    course.value = data
  } catch {
    navigateTo(localePath('/courses'))
  }
})

async function copyLink() {
  if (!import.meta.client) return
  await navigator.clipboard.writeText(shareUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
