<template>
  <div>
    <!-- En-tête -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <nav class="flex items-center gap-1.5 mb-3">
          <NuxtLink :to="localePath('/')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Dashboard</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <NuxtLink :to="localePath('/courses')" class="text-slate-400 text-sm font-medium hover:text-primary transition-colors">Mes cours</NuxtLink>
          <ChevronRight :size="14" class="text-slate-400" />
          <span class="text-slate-700 text-sm font-semibold">Avis &amp; Questions</span>
        </nav>
        <h1 class="text-2xl font-black tracking-tight text-slate-900">Avis &amp; Questions</h1>
        <p class="text-slate-400 text-sm mt-1">{{ course?.title }}</p>
      </div>
      <NuxtLink
        :to="localePath(`/instructor/courses/${slug}/settings`)"
        class="flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
      >
        <Settings :size="15" />
        Paramètres du cours
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <!-- Avis -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="font-bold text-slate-900 text-lg">Notes et avis</h3>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex items-center gap-0.5">
                <Star
                  v-for="n in 5"
                  :key="n"
                  :size="16"
                  :class="n <= Math.round(reviewsData.average) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'"
                />
              </div>
              <span class="text-sm font-bold text-slate-700">{{ reviewsData.average.toFixed(1) }}</span>
              <span class="text-sm text-slate-400">({{ reviewsData.count }} avis)</span>
            </div>
          </div>
        </div>

        <div v-if="loadingReviews" class="text-sm text-slate-400 text-center py-4">Chargement…</div>
        <div v-else-if="!reviewsData.reviews.length" class="text-sm text-slate-400 text-center py-4">
          Aucun avis pour le moment.
        </div>
        <div v-else class="space-y-5 max-h-[520px] overflow-y-auto pr-1">
          <div v-for="review in reviewsData.reviews" :key="review.id" class="flex gap-3">
            <img
              :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.firstName || review.user.id}`"
              class="w-9 h-9 rounded-full shrink-0"
              alt=""
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-900">{{ review.user.firstName }} {{ review.user.lastName }}</span>
                <div class="flex items-center gap-0.5">
                  <Star
                    v-for="n in 5"
                    :key="n"
                    :size="12"
                    :class="n <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'"
                  />
                </div>
              </div>
              <p v-if="review.comment" class="text-sm text-slate-600 mt-1 leading-snug">{{ review.comment }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions & réponses -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div class="flex items-center gap-2 mb-4">
          <MessageCircle :size="18" class="text-slate-400" />
          <h3 class="font-bold text-slate-900">Questions des apprenants</h3>
          <span class="text-xs font-bold text-slate-400">({{ qaData.questionCount }})</span>
        </div>

        <div v-if="loadingQa" class="text-sm text-slate-400 text-center py-4">Chargement…</div>
        <div v-else-if="!qaData.lessons.length" class="text-sm text-slate-400 text-center py-4">
          Aucune question pour le moment.
        </div>
        <div v-else class="space-y-8 max-h-[520px] overflow-y-auto pr-1">
          <div v-for="lesson in qaData.lessons" :key="lesson.id">
            <p class="text-[10px] font-black uppercase text-primary tracking-widest mb-3">
              {{ lesson.moduleTitle }} · {{ lesson.title }}
            </p>
            <div class="space-y-6">
              <div v-for="comment in lesson.comments" :key="comment.id" class="space-y-3">
                <LearnCommentRow
                  :comment="comment"
                  :my-user-id="myUserId"
                  can-moderate
                  @delete="handleDelete(lesson.id, comment.id)"
                  @reply="replyTo = replyTo === comment.id ? null : comment.id"
                />

                <div v-for="reply in comment.replies" :key="reply.id" class="pl-8">
                  <LearnCommentRow
                    :comment="reply"
                    :my-user-id="myUserId"
                    is-reply
                    can-moderate
                    @delete="handleDelete(lesson.id, reply.id)"
                  />
                </div>

                <div v-if="replyTo === comment.id" class="pl-8 flex gap-2">
                  <input
                    v-model="replyContent"
                    type="text"
                    class="flex-1 text-sm rounded-lg border border-slate-200 px-3 h-9 outline-none focus:border-primary transition-colors"
                    placeholder="Écrire une réponse..."
                    @keyup.enter="postReply(lesson.id, comment.id)"
                  />
                  <button
                    type="button"
                    class="px-3 h-9 rounded-lg bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
                    :disabled="!replyContent.trim() || posting"
                    @click="postReply(lesson.id, comment.id)"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ChevronRight, Settings, Star, MessageCircle } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const localePath = useLocalePath()
const creation = useCourseCreation()
const { user } = storeToRefs(useAuthStore())

const slug = route.params.slug
const myUserId = computed(() => user.value ? Number(user.value.id) : null)

const course = ref(null)
const loadingReviews = ref(true)
const loadingQa = ref(true)
const posting = ref(false)
const replyTo = ref(null)
const replyContent = ref('')

const reviewsData = reactive({ average: 0, count: 0, reviews: [] })
const qaData = reactive({ lessons: [], questionCount: 0 })

async function loadQa() {
  loadingQa.value = true
  try {
    const data = await creation.getQa(course.value.id)
    qaData.lessons = data.lessons
    qaData.questionCount = data.questionCount
  } catch {
    qaData.lessons = []
    qaData.questionCount = 0
  } finally {
    loadingQa.value = false
  }
}

onMounted(async () => {
  try {
    course.value = await creation.getCourse(slug)
  } catch {
    navigateTo(localePath('/courses'))
    return
  }

  try {
    const data = await creation.getReviews(course.value.id)
    reviewsData.average = data.average
    reviewsData.count = data.count
    reviewsData.reviews = data.reviews
  } catch {
    reviewsData.reviews = []
  } finally {
    loadingReviews.value = false
  }

  await loadQa()
})

async function postReply(lessonId, parentId) {
  if (!replyContent.value.trim() || posting.value) return
  posting.value = true
  try {
    await creation.postReply(lessonId, { content: replyContent.value.trim(), parentId })
    replyContent.value = ''
    replyTo.value = null
    await loadQa()
  } finally {
    posting.value = false
  }
}

async function handleDelete(lessonId, commentId) {
  await creation.deleteComment(lessonId, commentId)
  await loadQa()
}
</script>
