<template>
  <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
    <div class="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pb-6 border-b border-slate-100">
      <div class="space-y-1">
        <h3 class="font-bold text-slate-900 text-lg">{{ $t('learn.reviews.title') }}</h3>
        <div class="flex items-center gap-3">
          <span class="text-4xl font-extrabold text-slate-900">{{ average.toFixed(1) }}</span>
          <div>
            <div class="flex items-center gap-0.5">
              <Star
                v-for="n in 5"
                :key="n"
                :size="16"
                :class="n <= Math.round(average) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'"
              />
            </div>
            <p class="text-xs text-slate-400 font-medium mt-0.5">{{ $t('learn.reviews.count', { count }) }}</p>
          </div>
        </div>
      </div>

      <div class="w-full md:w-72 space-y-1">
        <div v-for="ratingVal in [5, 4, 3, 2, 1]" :key="ratingVal" class="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <span class="w-3 text-right">{{ ratingVal }}</span>
          <Star :size="10" class="text-amber-400 fill-amber-400 shrink-0" />
          <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-amber-400 rounded-full transition-all duration-500"
              :style="{ width: `${getPercentage(ratingVal)}%` }"
            />
          </div>
          <span class="w-8 text-right text-slate-400 font-bold">{{ getPercentage(ratingVal) }}%</span>
        </div>
      </div>
    </div>

    <div class="bg-[#f8f9fc] rounded-2xl p-5 border border-slate-100 transition-all duration-300">
      <p class="text-sm font-bold text-slate-800 mb-2">
        {{ myReview ? $t('learn.reviews.edit_yours') : $t('learn.reviews.leave_one') }}
      </p>
      
      <div class="flex items-center gap-1.5 mb-4">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="p-0.5 transition-transform hover:scale-125 focus:outline-none"
          @click="form.rating = n"
          @mouseenter="hoverRating = n"
          @mouseleave="hoverRating = 0"
        >
          <Star
            :size="26"
            class="transition-all duration-150"
            :class="n <= (hoverRating || form.rating) ? 'text-amber-400 fill-amber-400 scale-105' : 'text-slate-300 fill-transparent'"
          />
        </button>
      </div>

      <textarea
        v-model="form.comment"
        rows="3"
        class="w-full text-sm rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none bg-white"
        :placeholder="$t('learn.reviews.comment_placeholder')"
      />

      <div class="flex items-center justify-between mt-4">
        <button
          v-if="myReview"
          type="button"
          class="text-xs font-black text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
          :disabled="submitting"
          @click="handleDelete"
        >
          {{ $t('learn.reviews.delete') }}
        </button>
        <span v-else />
        <button
          type="button"
          class="px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 disabled:opacity-40"
          :disabled="!form.rating || submitting"
          @click="handleSubmit"
        >
          {{ myReview ? $t('learn.reviews.update') : $t('learn.reviews.submit') }}
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <h4 class="font-bold text-slate-800 text-sm">Commentaires des apprenants</h4>
      
      <div v-if="!reviews.length" class="text-sm text-slate-400 text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        {{ $t('learn.reviews.empty') }}
      </div>
      
      <div v-else class="divide-y divide-slate-100">
        <div v-for="review in reviews" :key="review.id" class="flex gap-4 py-4 first:pt-0 last:pb-0">
          <img
            :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.firstName || review.user.id}`"
            class="w-10 h-10 rounded-full border border-slate-250 shrink-0 bg-slate-50 shadow-sm"
            alt="Avatar"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-slate-900 truncate">
                {{ review.user.firstName }} {{ review.user.lastName }}
              </span>
              <span class="text-[10px] text-slate-400 font-semibold shrink-0">
                {{ formatDate(review.createdAt) }}
              </span>
            </div>
            
            <div class="flex items-center gap-0.5 mt-1">
              <Star
                v-for="n in 5"
                :key="n"
                :size="12"
                :class="n <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100 fill-slate-100'"
              />
            </div>
            
            <p v-if="review.comment" class="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{{ review.comment }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star } from 'lucide-vue-next'

const props = defineProps({ slug: { type: String, required: true } })

const student = useStudentCourse()

const reviews = ref([])
const average = ref(0)
const count = ref(0)
const myReview = ref(null)
const submitting = ref(false)

const form = reactive({ rating: 0, comment: '' })
const hoverRating = ref(0)

function applyData(data) {
  reviews.value = data.reviews || []
  average.value = data.average ?? 0
  count.value = data.count ?? 0
  myReview.value = data.myReview ?? null
  form.rating = data.myReview?.rating ?? 0
  form.comment = data.myReview?.comment ?? ''
}

onMounted(async () => {
  try {
    applyData(await student.getReviews(props.slug))
  } catch {
    reviews.value = []
  }
})

function getPercentage(starValue) {
  if (!reviews.value.length) return 0
  const matchingCount = reviews.value.filter(r => r.rating === starValue).length
  return Math.round((matchingCount / reviews.value.length) * 100)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

async function handleSubmit() {
  if (!form.rating || submitting.value) return
  submitting.value = true
  try {
    await student.submitReview(props.slug, { rating: form.rating, comment: form.comment })
    applyData(await student.getReviews(props.slug))
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (submitting.value) return
  submitting.value = true
  try {
    await student.deleteReview(props.slug)
    applyData(await student.getReviews(props.slug))
  } finally {
    submitting.value = false
  }
}
</script>
