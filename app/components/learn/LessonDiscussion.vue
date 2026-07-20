<template>
  <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
    <div class="flex items-center gap-2 mb-4">
      <MessageCircle :size="18" class="text-slate-400" />
      <h3 class="font-bold text-slate-900">{{ $t('learn.qa.title') }}</h3>
      <span class="text-xs font-bold text-slate-400">({{ comments.length }})</span>
    </div>

    <!-- Nouvelle question -->
    <div class="flex gap-3 mb-6">
      <img :src="myAvatar" class="w-9 h-9 rounded-full shrink-0" alt="" />
      <div class="flex-1">
        <textarea
          v-model="newContent"
          rows="2"
          class="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-primary transition-colors resize-none"
          :placeholder="$t('learn.qa.ask_placeholder')"
        />
        <div class="flex justify-end mt-2">
          <button
            type="button"
            class="px-4 h-8 rounded-lg bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
            :disabled="!newContent.trim() || posting"
            @click="postQuestion"
          >
            {{ $t('learn.qa.post') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-slate-400 text-center py-4">…</div>
    <div v-else-if="!comments.length" class="text-sm text-slate-400 text-center py-4">
      {{ $t('learn.qa.empty') }}
    </div>
    <div v-else class="space-y-6">
      <div v-for="comment in comments" :key="comment.id" class="space-y-3">
        <LearnCommentRow :comment="comment" :my-user-id="myUserId" @delete="handleDelete(comment.id)" @reply="replyTo = replyTo === comment.id ? null : comment.id" />

        <div v-for="reply in comment.replies" :key="reply.id" class="pl-8">
          <LearnCommentRow :comment="reply" :my-user-id="myUserId" is-reply @delete="handleDelete(reply.id)" />
        </div>

        <div v-if="replyTo === comment.id" class="pl-8 flex gap-2">
          <input
            v-model="replyContent"
            type="text"
            class="flex-1 text-sm rounded-lg border border-slate-200 px-3 h-9 outline-none focus:border-primary transition-colors"
            :placeholder="$t('learn.qa.reply_placeholder')"
            @keyup.enter="postReply(comment.id)"
          />
          <button
            type="button"
            class="px-3 h-9 rounded-lg bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-40"
            :disabled="!replyContent.trim() || posting"
            @click="postReply(comment.id)"
          >
            {{ $t('learn.qa.post') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MessageCircle } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

const props = defineProps({ lessonId: { type: Number, required: true } })

const student = useStudentCourse()
const { user } = storeToRefs(useAuthStore())

const myUserId = computed(() => user.value ? Number(user.value.id) : null)
const myAvatar = computed(() => `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.value?.firstName || 'Alex'}`)

const comments = ref([])
const loading = ref(true)
const newContent = ref('')
const posting = ref(false)
const replyTo = ref(null)
const replyContent = ref('')

async function load() {
  loading.value = true
  try {
    comments.value = await student.getComments(props.lessonId)
  } catch {
    comments.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.lessonId, () => {
  replyTo.value = null
  replyContent.value = ''
  newContent.value = ''
  load()
}, { immediate: true })

async function postQuestion() {
  if (!newContent.value.trim() || posting.value) return
  posting.value = true
  try {
    await student.postComment(props.lessonId, { content: newContent.value.trim() })
    newContent.value = ''
    await load()
  } finally {
    posting.value = false
  }
}

async function postReply(parentId) {
  if (!replyContent.value.trim() || posting.value) return
  posting.value = true
  try {
    await student.postComment(props.lessonId, { content: replyContent.value.trim(), parentId })
    replyContent.value = ''
    replyTo.value = null
    await load()
  } finally {
    posting.value = false
  }
}

async function handleDelete(commentId) {
  await student.deleteComment(props.lessonId, commentId)
  await load()
}
</script>
