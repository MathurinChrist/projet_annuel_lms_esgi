<template>
  <div class="text-on-surface antialiased overflow-x-hidden" style="background-color:#faf8ff;font-family:'Lexend',sans-serif;">

    <!-- Hero -->
    <section class="relative pt-12 sm:pt-20 pb-16 sm:pb-32 overflow-hidden" style="background:radial-gradient(circle at 0% 0%,rgba(19,91,236,.05) 0%,transparent 50%),radial-gradient(circle at 100% 100%,rgba(0,92,62,.03) 0%,transparent 50%);">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
        <div class="z-10">
          <span class="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-widest uppercase mb-6">
            Plateforme LMS
          </span>
          <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-6">
            Maîtrisez votre avenir avec <span class="text-blue-600">EduPulse</span>
          </h1>
          <p class="text-base sm:text-lg leading-relaxed text-slate-500 mb-10 max-w-xl">
            La plateforme d'apprentissage moderne pour les étudiants, formateurs et entreprises. Des cours en ligne, des conférences en direct et un suivi de progression complet.
          </p>
          <div class="flex flex-wrap gap-4">
            <NuxtLink
              :to="localePath('/auth/register')"
              class="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-200 hover:scale-[1.02] transition-all"
            >
              Commencer gratuitement
            </NuxtLink>
            <NuxtLink
              :to="localePath('/catalog')"
              class="px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              Explorer le catalogue
            </NuxtLink>
          </div>
        </div>

        <!-- Mock dashboard card -->
        <div class="relative hidden lg:block">
          <div class="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
          <div class="relative bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 p-6">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-3 h-3 rounded-full bg-red-400" />
              <div class="w-3 h-3 rounded-full bg-amber-400" />
              <div class="w-3 h-3 rounded-full bg-emerald-400" />
              <div class="flex-1 h-5 bg-slate-100 rounded ml-2" />
            </div>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="bg-blue-50 rounded-xl p-4">
                <div class="text-2xl font-black text-blue-600">12</div>
                <div class="text-xs text-slate-500 mt-1">Cours suivis</div>
              </div>
              <div class="bg-emerald-50 rounded-xl p-4">
                <div class="text-2xl font-black text-emerald-600">87%</div>
                <div class="text-xs text-slate-500 mt-1">Progression</div>
              </div>
              <div class="bg-purple-50 rounded-xl p-4">
                <div class="text-2xl font-black text-purple-600">5</div>
                <div class="text-xs text-slate-500 mt-1">Certificats</div>
              </div>
            </div>
            <div class="space-y-2">
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full" style="width:72%" />
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full" style="width:45%" />
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500 rounded-full" style="width:90%" />
              </div>
            </div>
            <div class="mt-4 p-4 bg-white/80 backdrop-blur border border-slate-100 rounded-xl flex items-center gap-3">
              <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                <CheckCircle2 :size="20" />
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900">Cours terminé</div>
                <div class="text-xs text-slate-500">Leadership Stratégique</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Social proof bar -->
    <section class="py-8 sm:py-12 bg-slate-50 border-y border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Une plateforme complète pour apprendre</p>
        <div class="flex flex-wrap justify-center items-center gap-12 opacity-50">
          <span class="text-xl font-black text-slate-700 italic">Nuxt.js</span>
          <span class="text-xl font-black text-slate-700 italic">Vue 3</span>
          <span class="text-xl font-black text-slate-700 italic">LiveKit</span>
          <span class="text-xl font-black text-slate-700 italic">Prisma</span>
          <span class="text-xl font-black text-slate-700 italic">PostgreSQL</span>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-12 sm:py-16 lg:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
          <p class="text-slate-500 max-w-2xl mx-auto">Scalable, flexible et ultra-rapide. Tout ce qu'il faut pour un apprentissage de qualité.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="feature in features" :key="feature.title" class="p-8 rounded-2xl bg-white border border-slate-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <component :is="feature.icon" :size="22" />
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-3">{{ feature.title }}</h3>
            <p class="text-sm text-slate-500 leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Courses -->
    <section class="py-12 sm:py-16 lg:py-20 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Cours à la une</h2>
            <p class="text-slate-500">Commencez votre parcours avec nos programmes les mieux notés.</p>
          </div>
          <NuxtLink :to="localePath('/catalog')" class="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
            Voir tous les cours <ArrowRight :size="16" />
          </NuxtLink>
        </div>

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
            <div class="aspect-video bg-slate-100" />
            <div class="p-6 space-y-3">
              <div class="h-3 bg-slate-100 rounded w-1/3" />
              <div class="h-4 bg-slate-100 rounded w-3/4" />
              <div class="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        </div>

        <div v-else-if="courses.length" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="course in courses"
            :key="course.id"
            :to="localePath(`/courses/${course.slug}`)"
            class="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all flex flex-col"
          >
            <div class="aspect-video relative overflow-hidden" :class="coverGradient(course.id)">
              <img v-if="course.coverImage" :src="course.coverImage" :alt="course.title" class="w-full h-full object-cover" />
              <div v-else class="absolute inset-0 flex items-center justify-center">
                <BookOpen :size="40" class="text-white/40" />
              </div>
              <div v-if="course.category" class="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {{ course.category.name }}
              </div>
            </div>
            <div class="p-6 flex flex-col flex-grow">
              <h3 class="text-base font-bold text-slate-900 mb-2 line-clamp-2">{{ course.title }}</h3>
              <p v-if="course.author" class="text-sm text-slate-500 mb-4">
                {{ course.author.firstName }} {{ course.author.lastName }}
              </p>
              <div class="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                <div v-if="course.reviewCount" class="flex items-center gap-1 text-amber-400">
                  <Star :size="16" class="fill-amber-400" />
                  <span class="font-bold text-sm text-slate-900">{{ course.rating?.toFixed(1) }}</span>
                  <span class="text-xs text-slate-400">({{ course.reviewCount }})</span>
                </div>
                <div v-else class="text-xs text-slate-400">Aucun avis</div>
                <div class="flex items-center gap-1 text-xs text-slate-500">
                  <Users :size="13" />
                  {{ course.enrollmentCount || 0 }} inscrits
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="text-center py-12 text-slate-400">Aucun cours disponible pour le moment.</div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mb-4">Votre chemin vers l'excellence</h2>
          <p class="text-slate-500">Un processus simple en trois étapes pour transformer votre carrière.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
          <div class="hidden md:block absolute top-10 inset-x-0 h-[2px] bg-slate-200 z-0" />
          <div v-for="(step, i) in steps" :key="i" class="relative group z-10">
            <div class="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform ring-[10px] ring-[#faf8ff]">
              {{ i + 1 }}
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-4">{{ step.title }}</h3>
            <p class="text-sm text-slate-500 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-16 sm:py-20 lg:py-24 bg-blue-600 text-white text-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute top-0 left-0 w-64 h-64 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div class="absolute bottom-0 right-0 w-96 h-96 border-4 border-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-6">Prêt à commencer votre parcours ?</h2>
        <p class="text-blue-200 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">Rejoignez des milliers d'apprenants qui développent leurs compétences sur EduPulse.</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <NuxtLink :to="localePath('/auth/register')" class="px-10 py-4 rounded-xl bg-white text-blue-600 font-bold hover:bg-slate-50 transition-all shadow-xl">
            Commencer gratuitement
          </NuxtLink>
          <NuxtLink :to="localePath('/catalog')" class="px-10 py-4 rounded-xl border border-white/30 text-white font-bold hover:bg-white/10 transition-all">
            Explorer les cours
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-50 border-t border-slate-200">
      <div class="flex flex-col md:flex-row justify-between items-center py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto gap-8">
        <div class="flex flex-col gap-3 text-center md:text-left">
          <div class="text-lg font-black text-blue-600">EduPulse</div>
          <p class="text-sm text-slate-500 max-w-xs">Plateforme d'apprentissage moderne pour étudiants, formateurs et entreprises.</p>
        </div>
        <div class="flex gap-8">
          <NuxtLink :to="localePath('/catalog')" class="text-sm text-slate-500 hover:text-blue-600 transition-colors">Catalogue</NuxtLink>
          <NuxtLink :to="localePath('/conferences')" class="text-sm text-slate-500 hover:text-blue-600 transition-colors">Conférences</NuxtLink>
          <NuxtLink :to="localePath('/auth/register')" class="text-sm text-slate-500 hover:text-blue-600 transition-colors">S'inscrire</NuxtLink>
        </div>
        <div class="text-sm text-slate-400">© {{ new Date().getFullYear() }} EduPulse. Tous droits réservés.</div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { BookOpen, Users, Star, ArrowRight, CheckCircle2, Smartphone, GraduationCap, Video, BarChart2 } from 'lucide-vue-next'

definePageMeta({ middleware: 'home-redirect', layout: 'landing' })

const localePath = useLocalePath()
const loading = ref(true)
const courses = ref([])

const features = [
  { icon: Smartphone, title: 'Apprenez partout', desc: 'Des cours responsive conçus pour un apprentissage fluide sur tous vos appareils.' },
  { icon: GraduationCap, title: 'Formateurs experts', desc: 'Des contenus créés par des professionnels reconnus dans leur domaine.' },
  { icon: Video, title: 'Conférences en direct', desc: 'Des sessions live interactives avec les formateurs pour apprendre en temps réel.' },
  { icon: BarChart2, title: 'Suivi intelligent', desc: 'Des rapports de progression détaillés pour mesurer et accélérer votre évolution.' },
]

const steps = [
  { title: 'Créez votre compte', desc: 'Inscrivez-vous en quelques secondes et accédez immédiatement à tout le catalogue.' },
  { title: 'Choisissez votre cours', desc: 'Parcourez des dizaines de cours dans de nombreuses thématiques.' },
  { title: 'Commencez à apprendre', desc: 'Suivez les leçons à votre rythme et obtenez votre certificat à la fin.' },
]

const GRADIENTS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-violet-500 to-purple-700',
  'bg-gradient-to-br from-emerald-400 to-teal-600',
  'bg-gradient-to-br from-orange-400 to-rose-500',
  'bg-gradient-to-br from-pink-400 to-fuchsia-600',
  'bg-gradient-to-br from-sky-400 to-blue-600',
]

function coverGradient(id) {
  return GRADIENTS[id % GRADIENTS.length]
}

onMounted(async () => {
  try {
    const data = await $fetch('/api/courses?limit=3')
    courses.value = data.courses || []
  } catch {
    courses.value = []
  } finally {
    loading.value = false
  }
})
</script>
