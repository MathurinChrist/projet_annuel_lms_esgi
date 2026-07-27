<script setup>
import { Track, ParticipantEvent } from 'livekit-client'
import { MicOff, Monitor } from 'lucide-vue-next'

const props = defineProps({
  participant: { type: Object, required: true },
  isLocal: { type: Boolean, default: false },
  fill: { type: Boolean, default: false },
  isScreen: { type: Boolean, default: false },
})

const container = ref(null)
const hasVideo = ref(false)
const hasMic = ref(true)

const trackSource = computed(() => props.isScreen ? Track.Source.ScreenShare : Track.Source.Camera)

onMounted(() => {
  attachExistingTracks()

  if (props.isLocal) {
    props.participant.on(ParticipantEvent.LocalTrackPublished, onLocalPublished)
    props.participant.on(ParticipantEvent.LocalTrackUnpublished, refreshVideo)
  } else {
    props.participant.on(ParticipantEvent.TrackSubscribed, onSubscribed)
    props.participant.on(ParticipantEvent.TrackUnsubscribed, onUnsubscribed)
  }
  if (!props.isScreen) {
    props.participant.on(ParticipantEvent.TrackMuted, refreshState)
    props.participant.on(ParticipantEvent.TrackUnmuted, refreshState)
  }
})

onBeforeUnmount(() => {
  props.participant.off(ParticipantEvent.LocalTrackPublished, onLocalPublished)
  props.participant.off(ParticipantEvent.LocalTrackUnpublished, refreshVideo)
  props.participant.off(ParticipantEvent.TrackSubscribed, onSubscribed)
  props.participant.off(ParticipantEvent.TrackUnsubscribed, onUnsubscribed)
  props.participant.off(ParticipantEvent.TrackMuted, refreshState)
  props.participant.off(ParticipantEvent.TrackUnmuted, refreshState)
  container.value?.querySelectorAll('video').forEach((v) => v.remove())
})

function attachExistingTracks() {
  const pub = props.participant.getTrackPublication(trackSource.value)
  if (pub?.track && (props.isLocal || pub.isSubscribed) && !pub.isMuted) {
    attachVideo(pub.track)
  }
  refreshState()
}

function onLocalPublished(pub) {
  if (pub.source === trackSource.value) attachVideo(pub.track)
}

function onSubscribed(track) {
  if (track.source === trackSource.value) attachVideo(track)
}

function onUnsubscribed(track) {
  if (track.source === trackSource.value) {
    track.detach()
    hasVideo.value = false
  }
}

function refreshVideo() {
  const pub = props.participant.getTrackPublication(trackSource.value)
  if (pub?.track && !pub.isMuted) {
    attachVideo(pub.track)
  } else {
    hasVideo.value = false
  }
}

function attachVideo(track) {
  if (!container.value) return
  container.value.querySelectorAll('video').forEach((v) => v.remove())
  const el = track.attach()
  const fit = props.isScreen ? 'contain' : 'cover'
  el.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};background:#000;`
  if (props.isLocal) el.muted = true
  container.value.appendChild(el)
  hasVideo.value = true
}

function refreshState() {
  const pub = props.participant.getTrackPublication(trackSource.value)
  const micPub = props.participant.getTrackPublication(Track.Source.Microphone)
  hasVideo.value = !!pub?.track && !pub.isMuted && (props.isLocal ? true : !!pub.isSubscribed)
  hasMic.value = !micPub || !micPub.isMuted
}

const displayName = computed(() => props.participant.name || props.participant.identity || '?')
const initial = computed(() => displayName.value.charAt(0).toUpperCase())
</script>

<template>
  <div
    class="overflow-hidden bg-slate-800"
    :class="fill ? 'absolute inset-0' : 'relative w-full rounded-2xl'"
  >
    <div ref="container" class="absolute inset-0" />

    <div v-if="!hasVideo" class="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <template v-if="isScreen">
        <div class="size-16 rounded-full bg-slate-600 flex items-center justify-center">
          <Monitor :size="28" class="text-slate-300" />
        </div>
        <span class="text-slate-400 text-sm font-medium">Partage d'écran</span>
      </template>
      <template v-else>
        <div class="size-16 rounded-full bg-slate-600 flex items-center justify-center">
          <span class="text-white text-2xl font-bold">{{ initial }}</span>
        </div>
        <span class="text-slate-400 text-sm font-medium">{{ displayName }}</span>
      </template>
    </div>

    <div class="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/50 to-transparent">
      <span class="text-xs text-white font-semibold drop-shadow">
        {{ isScreen ? `${displayName} · écran` : `${displayName}${isLocal ? ' (Vous)' : ''}` }}
      </span>
      <div v-if="!hasMic && !isScreen" class="size-5 rounded-full bg-red-500/90 flex items-center justify-center">
        <MicOff :size="11" class="text-white" />
      </div>
    </div>
  </div>
</template>
