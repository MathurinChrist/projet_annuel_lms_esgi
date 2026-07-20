<template>
  <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="font-bold text-slate-900 text-lg">{{ $t('learn.reviews.title') }}</h3>
        <div class="flex items-center gap-2 mt-1">
          <div class="flex items-center gap-0.5">
            <Star
              v-for="n in 5"
              :key="n"
              :size="16"
              :class="n <= Math.round(average) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'"
            />
          </div>
          <span class="text-sm font-bold text-slate-700">{{ average.toFixed(1) }}</span>
          <span class="text-sm text-slate-400">({{ $t('learn.reviews.count', { count }) }})</span>
        </div>
      </div>
    </div>

    <!-- Formulaire d'avis -->
    <div class="bg-[#f8f9fc] rounded-xl p-4 mb-6">
      <p class="text-sm font-bold text-slate-700 mb-2">
        {{ myReview ? $t('learn.reviews.edit_yours') : $t('learn.reviews.leave_one') }}
      </p>
      <div class="flex items-center gap-1 mb-3">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="p-0.5"
          @click="form.rating = n"
        >
          <Star :size="22" :class="n <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-300'" />
        </button>
      </div>
      <textarea
        v-model="form.comment"
        rows="2"
        class="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-primary transition-colors resize-none"
        :placeholder="$t('learn.reviews.comment_placeholder')"
      />
      <div class="flex items-center justify-between mt-3">
        <button
          v-if="myReview"
          type="button"
          class="text-xs font-bold text-red-500 hover:underline disabled:opacity-40"
          :disabled="submitting"
          @click="handleDelete"
        >
          {{ $t('learn.reviews.delete') }}
        </button>
        <span v-else />
        <button
          type="button"
          class="px-4 h-9 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
          :disabled="!form.rating || submitting"
          @click="handleSubmit"
        >
          {{ myReview ? $t('learn.reviews.update') : $t('learn.reviews.submit') }}
        </button>
      </div>
    </div>

    <!-- Liste des avis -->
    <div v-if="!reviews.length" class="text-sm text-slate-400 text-center py-4">
      {{ $t('learn.reviews.empty') }}
    </div>
    <div v-else class="space-y-5">
      <div v-for="review in reviews" :key="review.id" class="flex gap-3">
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

function applyData(data) {
  reviews.value = data.reviews
  average.value = data.average
  count.value = data.count
  myReview.value = data.myReview
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
