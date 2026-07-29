<template>
  <div class="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

    <section class="w-full md:w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col" :class="{ 'hidden md:flex': selectedConv }">

      <div class="px-4 pt-4 pb-3 border-b border-slate-100 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-black tracking-tight">{{ $t('messages.title') }}</h2>
          <button
            class="size-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            :title="$t('messages.new')"
            @click="showModal = true"
          >
            <SquarePen :size="15" />
          </button>
        </div>

        <div class="relative">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="search"
            type="text"
            :placeholder="$t('messages.search')"
            class="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <div class="flex gap-2">
          <button
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
            :class="filter === 'all' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
            @click="filter = 'all'"
          >{{ $t('messages.all') }}</button>
          <button
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
            :class="filter === 'FORMATEUR' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
            @click="filter = 'FORMATEUR'"
          >{{ $t('messages.instructors') }}</button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        <div v-if="pendingConvs" class="space-y-2 p-2">
          <div v-for="i in 4" :key="i" class="flex gap-3 p-3 animate-pulse">
            <div class="size-11 rounded-xl bg-slate-100 shrink-0" />
            <div class="flex-1 space-y-2 pt-1">
              <div class="h-3 bg-slate-100 rounded w-2/3" />
              <div class="h-2.5 bg-slate-100 rounded w-full" />
            </div>
          </div>
        </div>

        <template v-else>
          <div
            v-for="conv in filteredConvs"
            :key="conv.id"
            class="flex gap-3 p-3 rounded-xl cursor-pointer transition-colors"
            :class="selectedConv?.id === conv.id
              ? 'bg-primary/5 border border-primary/20'
              : 'hover:bg-slate-50 border border-transparent'"
            @click="selectConv(conv)"
          >
            <div class="relative shrink-0">
              <div
                class="size-11 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                :class="avatarColor(conv.other.id)"
              >
                {{ initials(conv.other) }}
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-1">
                <span class="text-sm font-bold truncate">
                  {{ conv.other.firstName }} {{ conv.other.lastName }}
                </span>
                <span
                  class="text-[10px] shrink-0 font-medium"
                  :class="selectedConv?.id === conv.id ? 'text-primary' : 'text-slate-400'"
                >
                  {{ formatConvTime(conv.lastMessage?.createdAt ?? conv.updatedAt) }}
                </span>
              </div>
              <p class="text-xs text-slate-400 truncate mt-0.5">
                <span v-if="conv.lastMessage">
                  <span v-if="conv.lastMessage.senderId !== conv.other.id" class="text-slate-500">{{ $t('messages.you_prefix') }} </span>
                  {{ conv.lastMessage.content }}
                </span>
                <span v-else class="italic">{{ $t('messages.start') }}</span>
              </p>
              <div class="flex items-center justify-between mt-1">
                <span
                  v-if="conv.other.role === 'FORMATEUR' || conv.other.role === 'ADMINISTRATEUR'"
                  class="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                >
                  {{ conv.other.role === 'ADMINISTRATEUR' ? $t('roles.admin') : $t('roles.instructor') }}
                </span>
                <span v-else />
                <span
                  v-if="conv.unreadCount > 0"
                  class="size-4 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full"
                >
                  {{ conv.unreadCount > 9 ? '9+' : conv.unreadCount }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="!filteredConvs.length" class="py-12 text-center text-slate-400 text-sm">
            <MessageSquare :size="28" class="mx-auto mb-3 text-slate-200" />
            {{ $t('messages.empty') }}
          </div>
        </template>
      </div>
    </section>

    <!-- Pane droite : conversation ouverte -->
    <section class="flex-1 flex flex-col bg-slate-50 min-w-0" :class="{ 'hidden md:flex': !selectedConv }">

      <!-- État vide -->
      <div v-if="!selectedConv" class="flex-1 flex flex-col items-center justify-center text-center">
        <div class="size-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-5">
          <MessageSquare :size="32" class="text-primary" />
        </div>
        <h3 class="font-bold text-slate-700 mb-1">{{ $t('messages.title') }}</h3>
        <p class="text-sm text-slate-400 mb-6">{{ $t('messages.no_conversation') }}</p>
        <button
          class="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
          @click="showModal = true"
        >
          <SquarePen :size="15" />
          {{ $t('messages.new') }}
        </button>
      </div>

      <template v-else>
        <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <button class="md:hidden mr-2 p-2 text-slate-500 hover:bg-slate-100 rounded-lg" @click="selectedConv = null">
            <ChevronLeft :size="20" />
          </button>
          <div class="flex items-center gap-3">
            <div
              class="size-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              :class="avatarColor(selectedConv.other.id)"
            >
              {{ initials(selectedConv.other) }}
            </div>
            <div>
              <h3 class="text-sm font-bold">{{ selectedConv.other.firstName }} {{ selectedConv.other.lastName }}</h3>
              <span
                v-if="selectedConv.other.role === 'FORMATEUR' || selectedConv.other.role === 'ADMINISTRATEUR'"
                class="text-[10px] text-slate-400 font-medium uppercase tracking-tight"
              >
                {{ selectedConv.other.role === 'ADMINISTRATEUR' ? $t('roles.admin') : $t('roles.instructor') }}
              </span>
              <span v-else class="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{{ $t('roles.learner') }}</span>
            </div>
          </div>
        </div>

        <div ref="threadEl" class="flex-1 overflow-y-auto p-6 space-y-5">
          <template v-for="item in groupedMessages" :key="item.key">
            <div v-if="item.type === 'separator'" class="flex justify-center">
              <span class="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-white px-4 py-1 rounded-full shadow-sm border border-slate-100">
                {{ item.label }}
              </span>
            </div>

            <div v-else-if="item.senderId !== myId" class="flex gap-3 max-w-[75%]">
              <div
                class="size-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                :class="avatarColor(selectedConv.other.id)"
              >
                {{ initials(selectedConv.other) }}
              </div>
              <div>
                <div class="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed text-slate-800">
                  {{ item.content }}
                </div>
                <p class="text-[10px] text-slate-400 mt-1.5 font-medium">{{ formatTime(item.createdAt) }}</p>
              </div>
            </div>

            <div v-else class="flex flex-row-reverse max-w-[75%] ml-auto">
              <div>
                <div class="bg-primary text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-md text-sm leading-relaxed">
                  {{ item.content }}
                </div>
                <div class="flex items-center justify-end gap-1 mt-1.5">
                  <p class="text-[10px] text-slate-400 font-medium">{{ formatTime(item.createdAt) }}</p>
                  <CheckCheck v-if="item.readAt" :size="12" class="text-primary" />
                  <Check v-else :size="12" class="text-slate-300" />
                </div>
              </div>
            </div>
          </template>

          <!-- Chargement messages -->
          <div v-if="pendingMsgs" class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex gap-3 animate-pulse" :class="i % 2 === 0 ? 'flex-row-reverse' : ''">
              <div class="size-8 rounded-lg bg-slate-200 shrink-0" />
              <div class="h-10 rounded-2xl bg-slate-200" :class="i % 2 === 0 ? 'w-48' : 'w-64'" />
            </div>
          </div>
        </div>

        <!-- Zone de saisie -->
        <div class="p-4 bg-white border-t border-slate-200 shrink-0">
          <div class="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <textarea
              v-model="draft"
              rows="2"
              :placeholder="$t('messages.placeholder')"
              class="w-full px-4 pt-3 pb-2 bg-transparent border-none resize-none text-sm focus:ring-0 outline-none text-slate-800 placeholder-slate-400"
              @keydown.enter.exact.prevent="send"
            />
            <div class="flex items-center justify-between px-3 pb-2.5">
              <span class="text-[11px] text-slate-400">{{ $t('messages.hint_enter') }}</span>
              <button
                class="flex items-center gap-1.5 px-4 h-8 rounded-lg bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                :disabled="!draft.trim() || sending"
                @click="send"
              >
                <SendHorizonal :size="13" />
                {{ $t('messages.send') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </section>

    <!-- Modal : nouvelle conversation -->
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeModal" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-base font-black">{{ $t('messages.new') }}</h3>
            <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" @click="closeModal">
              <X :size="16" />
            </button>
          </div>

          <div class="relative mb-4">
            <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="userSearch"
              type="text"
              :placeholder="$t('messages.search_users')"
              class="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              autofocus
            />
          </div>

          <div class="space-y-1 max-h-64 overflow-y-auto">
            <div v-if="searchingUsers" class="py-8 text-center text-slate-400 text-sm">{{ $t('common.loading') }}</div>
            <div v-else-if="!userSearch || userSearch.length < 2" class="py-8 text-center text-slate-400 text-sm">
              {{ $t('messages.search_min') }}
            </div>
            <div v-else-if="!userResults.length" class="py-8 text-center text-slate-400 text-sm">{{ $t('messages.no_results') }}</div>
            <button
              v-for="u in userResults"
              :key="u.id"
              class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              @click="startConv(u)"
            >
              <div
                class="size-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                :class="avatarColor(u.id)"
              >
                {{ initials(u) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold truncate">{{ u.firstName }} {{ u.lastName }}</p>
                <p class="text-xs text-slate-400 truncate">{{ u.email }}</p>
              </div>
              <span
                v-if="u.role === 'FORMATEUR' || u.role === 'ADMINISTRATEUR'"
                class="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0"
              >
                {{ u.role === 'ADMINISTRATEUR' ? $t('roles.admin') : $t('roles.instructor') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { Search, SquarePen, MessageSquare, SendHorizonal, Check, CheckCheck, X, ChevronLeft } from 'lucide-vue-next'

definePageMeta({ layout: 'messages' })

const token = useCookie('token')
const authStore = useAuthStore()
const { t, locale } = useI18n()
const myId = computed(() => authStore.user?.id)
const unreadCount = useUnreadMessages()

function apiHeaders() {
  const t = token.value
  if (!t || t.split('.').length !== 3) return {}
  return { Authorization: `Bearer ${t}` }
}

const conversations = ref([])
const pendingConvs = ref(true)
const selectedConv = ref(null)
const messages = ref([])
const pendingMsgs = ref(false)
const draft = ref('')
const sending = ref(false)
const search = ref('')
const filter = ref('all')
const showModal = ref(false)
const userSearch = ref('')
const userResults = ref([])
const searchingUsers = ref(false)
const threadEl = ref(null)

let ws = null
let searchTimer = null

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500',
  'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500',
]

function avatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

function initials(user) {
  const f = user?.firstName?.[0] ?? ''
  const l = user?.lastName?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
}

const dateLocale = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-US'))

function formatTime(date) {
  return new Date(date).toLocaleTimeString(dateLocale.value, { hour: '2-digit', minute: '2-digit' })
}

function formatConvTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString(dateLocale.value, { hour: '2-digit', minute: '2-digit' })
  }
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return t('dashboard.yesterday')
  return d.toLocaleDateString(dateLocale.value, { day: 'numeric', month: 'short' })
}

function formatDateLabel(date) {
  const d = new Date(date)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return locale.value === 'fr' ? "Aujourd'hui" : 'Today'
  }
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return t('dashboard.yesterday')
  return d.toLocaleDateString(dateLocale.value, { day: 'numeric', month: 'long', year: 'numeric' })
}

const filteredConvs = computed(() => {
  return conversations.value.filter((c) => {
    const name = `${c.other.firstName ?? ''} ${c.other.lastName ?? ''}`.toLowerCase()
    const matchSearch = !search.value || name.includes(search.value.toLowerCase())
    const matchFilter = filter.value === 'all' || c.other.role === filter.value
    return matchSearch && matchFilter
  })
})

const groupedMessages = computed(() => {
  const items = []
  let lastDate = null
  for (const msg of messages.value) {
    const d = new Date(msg.createdAt).toDateString()
    if (d !== lastDate) {
      lastDate = d
      items.push({ key: `sep-${d}`, type: 'separator', label: formatDateLabel(msg.createdAt) })
    }
    items.push({ key: `msg-${msg.id}`, type: 'message', ...msg })
  }
  return items
})

function syncUnreadCount() {
  unreadCount.value = conversations.value.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)
}

async function loadConversations() {
  try {
    conversations.value = await $fetch('/api/messages', {
      credentials: 'include',
      headers: apiHeaders(),
    })
    syncUnreadCount()
  } finally {
    pendingConvs.value = false
  }
}

async function selectConv(conv) {
  selectedConv.value = conv
  conv.unreadCount = 0
  syncUnreadCount()
  messages.value = []
  pendingMsgs.value = true
  try {
    messages.value = await $fetch(`/api/messages/${conv.id}`, {
      credentials: 'include',
      headers: apiHeaders(),
    })
    await nextTick()
    scrollToBottom()
  } finally {
    pendingMsgs.value = false
  }
}

async function send() {
  if (!draft.value.trim() || sending.value || !selectedConv.value) return
  const content = draft.value.trim()
  draft.value = ''
  sending.value = true
  try {
    const msg = await $fetch(`/api/messages/${selectedConv.value.id}`, {
      method: 'POST',
      body: { content },
      credentials: 'include',
      headers: apiHeaders(),
    })
    messages.value.push(msg)
    updateConvLastMessage(selectedConv.value.id, msg)
    await nextTick()
    scrollToBottom()
  } finally {
    sending.value = false
  }
}

async function startConv(user) {
  closeModal()
  const conv = await $fetch('/api/messages', {
    method: 'POST',
    body: { userId: user.id },
    credentials: 'include',
    headers: apiHeaders(),
  })
  const existing = conversations.value.find((c) => c.id === conv.id)
  if (!existing) conversations.value.unshift(conv)
  await selectConv(conv)
}

function updateConvLastMessage(convId, msg) {
  const idx = conversations.value.findIndex((c) => c.id === convId)
  if (idx !== -1) {
    conversations.value[idx].lastMessage = msg
    conversations.value[idx].updatedAt = msg.createdAt
    const [conv] = conversations.value.splice(idx, 1)
    conversations.value.unshift(conv)
  }
}

function scrollToBottom() {
  if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight
}

function setupWs() {
  if (!import.meta.client) return
  const jwt = token.value
  if (!jwt || jwt.split('.').length !== 3) return
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  ws = new WebSocket(`${proto}://${window.location.host}/ws/messages?token=${jwt}`)
  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      if (data.type === 'message') {
        updateConvLastMessage(data.conversationId, data.message)
        if (selectedConv.value?.id === data.conversationId) {
          messages.value.push(data.message)
          nextTick(scrollToBottom)
        } else {
          const idx = conversations.value.findIndex((c) => c.id === data.conversationId)
          if (idx !== -1) {
            conversations.value[idx].unreadCount++
            syncUnreadCount()
          }
        }
      }
    } catch {}
  }
  ws.onerror = () => {}
}

function closeModal() {
  showModal.value = false
  userSearch.value = ''
  userResults.value = []
}

watch(userSearch, (val) => {
  clearTimeout(searchTimer)
  if (!val || val.length < 2) { userResults.value = []; return }
  searchingUsers.value = true
  searchTimer = setTimeout(async () => {
    try {
      userResults.value = await $fetch(`/api/users/search?q=${encodeURIComponent(val)}`, {
        credentials: 'include',
        headers: apiHeaders(),
      })
    } finally {
      searchingUsers.value = false
    }
  }, 300)
})

onMounted(async () => {
  await loadConversations()
  setupWs()
  const convId = Number(useRoute().query.conv)
  if (convId) {
    const match = conversations.value.find(c => c.id === convId)
    if (match) selectConv(match)
  }
})

onUnmounted(() => {
  ws?.close()
  clearTimeout(searchTimer)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
