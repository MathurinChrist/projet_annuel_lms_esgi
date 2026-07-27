<script setup>
import { Room, RoomEvent, Track } from 'livekit-client'
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff, MessageSquare,
  PhoneOff, Hand, Users, Send, GraduationCap, Loader2, X, Check, Ban,
} from 'lucide-vue-next'

const props = defineProps({
  token: { type: String, required: true },
  livekitUrl: { type: String, required: true },
  conferenceTitle: { type: String, default: '' },
  isHost: { type: Boolean, default: false },
  conferenceId: { type: Number, default: 0 },
  roomName: { type: String, required: true },
})
const emit = defineEmits(['ended'])

const { t, locale } = useI18n()
const dateLocale = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-US'))
const displayTitle = computed(() => props.conferenceTitle || t('conferenceRoom.default_title'))

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const tokenCookie = useCookie('token')

const room = new Room()
const isConnecting = ref(true)
const connectError = ref(null)
const localParticipant = ref(null)
const remoteParticipants = ref([])
const isMicOn = ref(false)
const isCameraOn = ref(false)
const isScreenSharing = ref(false)
const remoteScreenShares = ref([])
const isEnding = ref(false)
const canPublish = ref(props.isHost)

const featuredKey = ref(null)
const messages = ref([])
const chatInput = ref('')
const chatContainer = ref(null)
const activeSidebarTab = ref('chat')
const showSidebar = ref(true)
const elapsedSeconds = ref(0)
let timerInterval = null

// Raise hand
const myHandRaised = ref(false)
const raisedHands = ref([]) // [{ identity, name }]

const allParticipants = computed(() => {
  const list = []
  if (localParticipant.value) {
    list.push({ key: localParticipant.value.identity, participant: localParticipant.value, isLocal: true, isScreen: false })
    if (isScreenSharing.value) {
      list.push({ key: localParticipant.value.identity + ':screen', participant: localParticipant.value, isLocal: true, isScreen: true })
    }
  }
  remoteParticipants.value.forEach((p) => {
    list.push({ key: p.identity, participant: p, isLocal: false, isScreen: false })
  })
  remoteScreenShares.value.forEach((p) => {
    list.push({ key: p.identity + ':screen', participant: p, isLocal: false, isScreen: true })
  })
  return list
})

const featuredParticipant = computed(() => {
  if (!allParticipants.value.length) return null
  if (!featuredKey.value) return allParticipants.value[0]
  return allParticipants.value.find((p) => p.key === featuredKey.value) || allParticipants.value[0]
})

const carouselParticipants = computed(() => {
  const fk = featuredParticipant.value?.key
  return allParticipants.value.filter((p) => p.key !== fk)
})

const totalParticipants = computed(() => allParticipants.value.length)

const elapsedDisplay = computed(() => {
  const h = Math.floor(elapsedSeconds.value / 3600)
  const m = Math.floor((elapsedSeconds.value % 3600) / 60)
  const s = elapsedSeconds.value % 60
  const parts = []
  if (h > 0) parts.push(String(h).padStart(2, '0'))
  parts.push(String(m).padStart(2, '0'))
  parts.push(String(s).padStart(2, '0'))
  return parts.join(':')
})

const localInitial = computed(() =>
  (room.localParticipant?.name || room.localParticipant?.identity || 'U').charAt(0).toUpperCase()
)

onMounted(async () => {
  try {
    room.on(RoomEvent.ParticipantConnected, (p) => {
      remoteParticipants.value.push(p)
      pushSystem(`${p.name || p.identity} a rejoint la conférence`)
    })

    room.on(RoomEvent.ParticipantDisconnected, (p) => {
      remoteParticipants.value = remoteParticipants.value.filter((r) => r.identity !== p.identity)
      remoteScreenShares.value = remoteScreenShares.value.filter((r) => r.identity !== p.identity)
      raisedHands.value = raisedHands.value.filter((h) => h.identity !== p.identity)
      if (featuredKey.value === p.identity || featuredKey.value === p.identity + ':screen') {
        featuredKey.value = null
      }
      pushSystem(`${p.name || p.identity} a quitté la conférence`)
    })

    room.on(RoomEvent.TrackPublished, (pub, participant) => {
      if (pub.source === Track.Source.ScreenShare) {
        if (!remoteScreenShares.value.find((p) => p.identity === participant.identity)) {
          remoteScreenShares.value.push(participant)
          featuredKey.value = participant.identity + ':screen'
          pushSystem(`${participant.name || participant.identity} partage son écran`)
        }
      }
    })

    room.on(RoomEvent.TrackUnpublished, (pub, participant) => {
      if (pub.source === Track.Source.ScreenShare) {
        remoteScreenShares.value = remoteScreenShares.value.filter((p) => p.identity !== participant.identity)
        if (featuredKey.value === participant.identity + ':screen') featuredKey.value = null
        pushSystem(`${participant.name || participant.identity} a arrêté le partage d'écran`)
      }
    })

    room.on(RoomEvent.LocalTrackPublished, (pub) => {
      if (pub.source === Track.Source.ScreenShare) {
        isScreenSharing.value = true
        featuredKey.value = room.localParticipant.identity + ':screen'
        pushSystem(t('conferenceRoom.sharing'))
      }
    })

    room.on(RoomEvent.LocalTrackUnpublished, (pub) => {
      if (pub.source === Track.Source.ScreenShare) {
        isScreenSharing.value = false
        if (featuredKey.value === room.localParticipant.identity + ':screen') featuredKey.value = null
        pushSystem(t('conferenceRoom.stopped_sharing'))
      }
    })

    room.on(RoomEvent.ParticipantPermissionsChanged, () => {
      const perms = room.localParticipant.permissions
      canPublish.value = perms?.canPublish ?? false
    })

    room.on(RoomEvent.DataReceived, (payload, participant) => {
      try {
        const data = JSON.parse(decoder.decode(payload))

        if (data.type === 'chat') {
          messages.value.push({
            text: data.text,
            sender: participant?.name || participant?.identity || 'Inconnu',
            isOwn: false,
            isInstructor: data.isInstructor,
            timestamp: new Date(),
          })
          scrollChat()
        }

        if (data.type === 'raise-hand' && participant) {
          if (!raisedHands.value.find((h) => h.identity === participant.identity)) {
            raisedHands.value.push({ identity: participant.identity, name: participant.name || participant.identity })
          }
        }

        if (data.type === 'lower-hand' && participant) {
          raisedHands.value = raisedHands.value.filter((h) => h.identity !== participant.identity)
        }

        if (data.type === 'hand-granted') {
          myHandRaised.value = false
          canPublish.value = true
          pushSystem(t('conferenceRoom.floor_granted'))
        }

        if (data.type === 'hand-rejected') {
          myHandRaised.value = false
          pushSystem(t('conferenceRoom.floor_denied'))
        }
      } catch {}
    })

    await room.connect(props.livekitUrl, props.token)
    localParticipant.value = room.localParticipant

    room.remoteParticipants.forEach((p) => {
      remoteParticipants.value.push(p)
      const screenPub = p.getTrackPublication(Track.Source.ScreenShare)
      if (screenPub) remoteScreenShares.value.push(p)
    })

    isConnecting.value = false

    if (props.isHost) {
      await room.localParticipant.enableCameraAndMicrophone()
      isMicOn.value = true
      isCameraOn.value = true
    }

    timerInterval = setInterval(() => elapsedSeconds.value++, 1000)
  } catch (e) {
    connectError.value = e.message || t('conferenceRoom.connect_error')
    isConnecting.value = false
  }
})

onBeforeUnmount(() => {
  clearInterval(timerInterval)
  room.disconnect()
})

function pushSystem(text) {
  messages.value.push({ system: true, text })
}

function setFeatured(key) {
  featuredKey.value = key
}

async function toggleMic() {
  isMicOn.value = !isMicOn.value
  await room.localParticipant.setMicrophoneEnabled(isMicOn.value)
}

async function toggleCamera() {
  isCameraOn.value = !isCameraOn.value
  await room.localParticipant.setCameraEnabled(isCameraOn.value)
}

async function toggleScreenShare() {
  if (isScreenSharing.value) {
    await room.localParticipant.setScreenShareEnabled(false)
  } else {
    try {
      await room.localParticipant.setScreenShareEnabled(true)
    } catch {}
  }
}

async function toggleHand() {
  myHandRaised.value = !myHandRaised.value
  await room.localParticipant.publishData(
    encoder.encode(JSON.stringify({ type: myHandRaised.value ? 'raise-hand' : 'lower-hand' })),
    { reliable: true },
  )
}

async function grantSpeech(identity) {
  try {
    await $fetch('/api/livekit/grant', {
      method: 'POST',
      body: { roomName: props.roomName, identity, grant: true },
      headers: { Authorization: `Bearer ${tokenCookie.value}` },
    })
    await room.localParticipant.publishData(
      encoder.encode(JSON.stringify({ type: 'hand-granted' })),
      { reliable: true, destinationIdentities: [identity] },
    )
    raisedHands.value = raisedHands.value.filter((h) => h.identity !== identity)
  } catch {}
}

async function revokeSpeech(identity) {
  try {
    await $fetch('/api/livekit/grant', {
      method: 'POST',
      body: { roomName: props.roomName, identity, grant: false },
      headers: { Authorization: `Bearer ${tokenCookie.value}` },
    })
  } catch {}
}

async function rejectHand(identity) {
  await room.localParticipant.publishData(
    encoder.encode(JSON.stringify({ type: 'hand-rejected' })),
    { reliable: true, destinationIdentities: [identity] },
  )
  raisedHands.value = raisedHands.value.filter((h) => h.identity !== identity)
}

async function sendMessage() {
  const text = chatInput.value.trim()
  if (!text) return
  messages.value.push({ text, sender: t('messages.you_prefix').replace(/:$/, ''), isOwn: true, isInstructor: props.isHost, timestamp: new Date() })
  chatInput.value = ''
  scrollChat()
  await room.localParticipant.publishData(
    encoder.encode(JSON.stringify({ type: 'chat', text, isInstructor: props.isHost })),
    { reliable: true },
  )
}

function scrollChat() {
  nextTick(() => {
    if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  })
}

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString(dateLocale.value, { hour: '2-digit', minute: '2-digit' })
}

async function leave() {
  if (props.isHost) {
    if (!confirm(t('conferenceRoom.confirm_end'))) return
    isEnding.value = true
    if (props.conferenceId) {
      try {
        await $fetch(`/api/instructor/conferences/${props.conferenceId}/end`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${tokenCookie.value}` },
        })
      } catch {}
    }
  }
  clearInterval(timerInterval)
  room.disconnect()
  emit('ended')
}

function hasRaisedHand(identity) {
  return raisedHands.value.some((h) => h.identity === identity)
}

function hasGrantedSpeech(participant) {
  return participant.permissions?.canPublish && !props.isHost
}
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900">

    <header class="shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200">
      <div class="flex items-center gap-4 text-primary">
        <GraduationCap :size="22" />
        <div>
          <h2 class="text-slate-900 text-sm font-bold leading-tight">{{ displayTitle }}</h2>
          <div v-if="!isConnecting && !connectError" class="flex items-center gap-1.5 mt-0.5">
            <span class="size-1.5 rounded-full bg-red-500 animate-pulse" />
            <span class="text-[11px] text-slate-500 font-medium tracking-wide">LIVE · {{ elapsedDisplay }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button
          :disabled="isEnding"
          class="flex items-center gap-1.5 px-4 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
          @click="leave"
        >
          {{ isHost ? (isEnding ? $t('conferenceRoom.ending') : $t('conferenceRoom.end')) : $t('conferenceRoom.leave') }}
        </button>
        <div class="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
          {{ localInitial }}
        </div>
      </div>
    </header>

    <main class="flex flex-1 overflow-hidden">

      <div class="flex-1 flex flex-col min-w-0">

        <div class="flex-1 flex items-center justify-center relative p-3">
          <div v-if="isConnecting" class="flex flex-col items-center gap-4 text-slate-400">
            <Loader2 :size="40" class="animate-spin" />
            <p class="text-sm">{{ $t('conferences.connecting') }}</p>
          </div>

          <div v-else-if="connectError" class="text-center">
            <p class="text-red-400 font-bold mb-1">{{ $t('conferenceRoom.connect_error') }}</p>
            <p class="text-slate-500 text-sm">{{ connectError }}</p>
          </div>

          <div v-else-if="featuredParticipant" class="relative w-full h-full max-w-5xl rounded-xl overflow-hidden shadow-2xl bg-black">
            <ConferenceParticipantTile
              :key="featuredParticipant.key"
              :participant="featuredParticipant.participant"
              :is-local="featuredParticipant.isLocal"
              :is-screen="featuredParticipant.isScreen"
              fill
            />
          </div>

          <p v-else class="text-slate-600 text-sm">{{ $t('conferences.no_participants') }}</p>
        </div>

        <div v-if="carouselParticipants.length" class="shrink-0 bg-slate-800 border-t border-slate-700">
          <div class="flex h-full overflow-x-auto p-3 gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              v-for="item in carouselParticipants"
              :key="item.key"
              class="shrink-0 w-36 cursor-pointer rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all"
              @click="setFeatured(item.key)"
            >
              <ConferenceParticipantTile
                :participant="item.participant"
                :is-local="item.isLocal"
                :is-screen="item.isScreen"
                class="aspect-video"
              />
            </div>
          </div>
        </div>

        <div class="shrink-0 flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200">
          <div class="flex items-center gap-1">

            <template v-if="isHost || canPublish">
              <button
                class="p-3 rounded-lg transition-colors"
                :class="isMicOn ? 'text-white bg-primary hover:bg-blue-700' : 'text-white bg-red-500 hover:bg-red-600'"
                @click="toggleMic"
              >
                <Mic v-if="isMicOn" :size="22" />
                <MicOff v-else :size="22" />
              </button>

              <button
                class="p-3 rounded-lg transition-colors"
                :class="isCameraOn ? 'text-slate-700 hover:bg-slate-100' : 'text-white bg-red-500 hover:bg-red-600'"
                @click="toggleCamera"
              >
                <Video v-if="isCameraOn" :size="22" />
                <VideoOff v-else :size="22" />
              </button>

              <div class="w-px h-8 bg-slate-200 mx-2" />

              <button
                class="p-3 rounded-lg transition-colors"
                :class="isScreenSharing ? 'text-primary bg-primary/10' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'"
                @click="toggleScreenShare"
              >
                <ScreenShare v-if="!isScreenSharing" :size="22" />
                <ScreenShareOff v-else :size="22" />
              </button>

              <div class="w-px h-8 bg-slate-200 mx-2" />
            </template>

            <!-- Lever la main : non-hôtes uniquement -->
            <button
              v-if="!isHost"
              class="p-3 rounded-lg transition-colors"
              :class="myHandRaised ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'"
              :title="myHandRaised ? 'Baisser la main' : 'Lever la main'"
              @click="toggleHand"
            >
              <Hand :size="22" />
            </button>

            <div class="w-px h-8 bg-slate-200 mx-2" />

            <button
              class="p-3 rounded-lg transition-colors"
              :class="showSidebar && activeSidebarTab === 'chat' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'"
              @click="() => { if (activeSidebarTab === 'chat' && showSidebar) { showSidebar = false } else { activeSidebarTab = 'chat'; showSidebar = true } }"
            >
              <MessageSquare :size="22" />
            </button>

            <button
              class="p-3 rounded-lg transition-colors relative"
              :class="showSidebar && activeSidebarTab === 'people' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'"
              @click="() => { if (activeSidebarTab === 'people' && showSidebar) { showSidebar = false } else { activeSidebarTab = 'people'; showSidebar = true } }"
            >
              <Users :size="22" />
              <span
                v-if="isHost && raisedHands.length"
                class="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center"
              >
                {{ raisedHands.length }}
              </span>
            </button>
          </div>

          <button
            :disabled="isEnding"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors disabled:opacity-50"
            @click="leave"
          >
            <PhoneOff :size="18" />
            {{ isHost ? (isEnding ? $t('conferenceRoom.ending_session') : $t('conferenceRoom.end_session')) : $t('conferenceRoom.leave') }}
          </button>
        </div>
      </div>

      <!-- Sidebar -->
      <aside v-if="showSidebar" class="w-80 shrink-0 bg-white border-l border-slate-200 flex flex-col">
        <div class="flex border-b border-slate-200 shrink-0 items-center">
          <button
            class="flex-1 py-3.5 text-sm font-bold border-b-2 transition-colors"
            :class="activeSidebarTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'"
            @click="activeSidebarTab = 'chat'"
          >
            Chat
          </button>
          <button
            class="flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors relative"
            :class="activeSidebarTab === 'people' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'"
            @click="activeSidebarTab = 'people'"
          >
            Participants ({{ totalParticipants }})
            <span
              v-if="isHost && raisedHands.length"
              class="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold"
            >
              {{ raisedHands.length }} main(s)
            </span>
          </button>
          <button class="p-2 mr-1 text-slate-300 hover:text-slate-500 transition-colors" @click="showSidebar = false">
            <X :size="16" />
          </button>
        </div>

        <!-- Chat -->
        <template v-if="activeSidebarTab === 'chat'">
          <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            <div v-if="!messages.length" class="flex flex-col items-center justify-center h-full py-12 text-slate-400 gap-3">
              <MessageSquare :size="28" class="opacity-30" />
              <p class="text-sm">{{ $t('messages.empty') }}</p>
            </div>

            <template v-for="(msg, i) in messages" :key="i">
              <div v-if="msg.system" class="text-center">
                <span class="text-[11px] text-slate-400 bg-slate-200 px-2.5 py-0.5 rounded-full">{{ msg.text }}</span>
              </div>

              <div v-else class="flex flex-col gap-1" :class="msg.isOwn ? 'items-end' : 'items-start'">
                <div class="flex items-center gap-1.5">
                  <span v-if="msg.isInstructor && !msg.isOwn" class="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">INSTRUCTEUR</span>
                  <span class="text-xs font-bold text-slate-700">{{ msg.isOwn ? 'Vous' : msg.sender }}</span>
                  <span class="text-[10px] text-slate-400">{{ formatTime(msg.timestamp) }}</span>
                </div>
                <div
                  class="px-3 py-2 rounded-xl text-sm max-w-[85%] break-words shadow-sm"
                  :class="msg.isOwn
                    ? 'bg-primary text-white rounded-tr-sm'
                    : msg.isInstructor
                      ? 'bg-primary/5 border border-primary/20 text-slate-800 rounded-tl-sm'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'"
                >
                  {{ msg.text }}
                </div>
              </div>
            </template>
          </div>

          <div class="p-4 border-t border-slate-200 shrink-0">
            <form class="relative" @submit.prevent="sendMessage">
              <input
                v-model="chatInput"
                :placeholder="$t('messages.placeholder')"
                class="w-full pl-4 pr-10 py-3 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary placeholder-slate-400"
              />
              <button type="submit" class="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-blue-700 transition-colors">
                <Send :size="18" />
              </button>
            </form>
          </div>
        </template>

        <!-- Participants -->
        <div v-else class="flex-1 overflow-y-auto p-3 space-y-1">
          <div
            v-for="item in allParticipants.filter(i => !i.isScreen)"
            :key="item.key"
            class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div class="relative size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {{ (item.participant.name || item.participant.identity || '?').charAt(0).toUpperCase() }}
              <span
                v-if="!item.isLocal && hasRaisedHand(item.participant.identity)"
                class="absolute -top-1 -right-1 text-base leading-none"
              >✋</span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700 truncate">
                {{ item.participant.name || item.participant.identity }}
                <span v-if="item.isLocal" class="text-slate-400 font-normal"> (Vous)</span>
              </p>
              <p v-if="item.isLocal && isHost" class="text-xs text-primary font-medium">{{ $t('roles.instructor') }}</p>
              <p v-if="!item.isLocal && item.participant.permissions?.canPublish" class="text-xs text-green-600 font-medium">Parole accordée</p>
            </div>

            <!-- Contrôles hôte -->
            <template v-if="isHost && !item.isLocal">
              <div v-if="hasRaisedHand(item.participant.identity)" class="flex items-center gap-1">
                <button
                  class="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  title="Accorder la parole"
                  @click="grantSpeech(item.participant.identity)"
                >
                  <Check :size="14" />
                </button>
                <button
                  class="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="Refuser"
                  @click="rejectHand(item.participant.identity)"
                >
                  <Ban :size="14" />
                </button>
              </div>
              <button
                v-else-if="item.participant.permissions?.canPublish"
                class="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                :title="$t('conferenceRoom.revoke_floor')"
                @click="revokeSpeech(item.participant.identity)"
              >
                <MicOff :size="14" />
              </button>
            </template>
          </div>
        </div>
      </aside>

    </main>
  </div>
</template>
