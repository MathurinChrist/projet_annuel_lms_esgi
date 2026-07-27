<template>
  <div class="h-screen">
    <div v-if="loading" class="h-full flex items-center justify-center bg-slate-900">
      <div class="flex flex-col items-center gap-4 text-slate-400">
        <div class="size-10 border-2 border-slate-600 border-t-primary rounded-full animate-spin" />
        <p class="text-sm">{{ $t('conferences.connecting') }}</p>
      </div>
    </div>

    <div v-else-if="error" class="h-full flex items-center justify-center bg-slate-900">
      <div class="text-center">
        <p class="text-red-400 font-bold mb-2">{{ error }}</p>
        <NuxtLink :to="localePath('/conferences')" class="text-primary text-sm hover:underline">{{ $t('conferences.title') }}</NuxtLink>
      </div>
    </div>

    <ConferenceRoom
      v-else
      :token="roomData.token"
      :livekit-url="$config.public.livekitUrl"
      :conference-title="roomData.conference.title"
      :is-host="roomData.isHost"
      :conference-id="roomData.conference.id"
      :room-name="roomName"
      @ended="handleEnded"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const token = useCookie('token')

const roomName = route.params.roomName
const loading = ref(true)
const error = ref(null)
const roomData = ref(null)

onMounted(async () => {
  try {
    roomData.value = await $fetch('/api/livekit/token', {
      method: 'POST',
      body: { roomName },
      headers: { Authorization: `Bearer ${token.value}` },
    })
  } catch (e) {
    error.value = e.data?.statusMessage || t('conferences.join_error')
  } finally {
    loading.value = false
  }
})

function handleEnded() {
  router.push(localePath('/conferences'))
}
</script>
