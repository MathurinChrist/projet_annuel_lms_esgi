<template>
  <div class="flex gap-3">
    <img :src="avatar" class="w-9 h-9 rounded-full shrink-0" alt="" />
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-bold text-slate-900">{{ comment.user.firstName }} {{ comment.user.lastName }}</span>
        <span
          v-if="comment.user.role === 'FORMATEUR' || comment.user.role === 'ADMINISTRATEUR'"
          class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase"
        >
          {{ $t('learn.qa.instructor') }}
        </span>
        <span class="text-xs text-slate-400">{{ formattedDate }}</span>
      </div>
      <p class="text-sm text-slate-600 mt-0.5 leading-snug">{{ comment.content }}</p>
      <div class="flex items-center gap-3 mt-1">
        <button
          v-if="!isReply"
          type="button"
          class="text-xs font-bold text-slate-400 hover:text-primary transition-colors"
          @click="$emit('reply')"
        >
          {{ $t('learn.qa.reply') }}
        </button>
        <button
          v-if="myUserId === comment.userId || canModerate"
          type="button"
          class="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
          @click="$emit('delete')"
        >
          {{ $t('learn.qa.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  comment: { type: Object, required: true },
  myUserId: { type: Number, default: null },
  isReply: { type: Boolean, default: false },
  canModerate: { type: Boolean, default: false },
})
defineEmits(['reply', 'delete'])

const avatar = computed(() => `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.comment.user.firstName || props.comment.user.id}`)
const formattedDate = computed(() => new Date(props.comment.createdAt).toLocaleDateString())
</script>
