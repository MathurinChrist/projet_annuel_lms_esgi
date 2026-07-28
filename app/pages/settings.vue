<template>
  <div class="space-y-8 max-w-4xl">
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{{ $t('settings.title') }}</h1>
      <p class="text-sm text-slate-500 mt-1">
        {{ $t('settings.subtitle') }}
      </p>
    </div>

    <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-px overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors relative"
        :class="activeTab === tab.id
          ? 'text-[#0A66C2] bg-white border border-b-white border-slate-200 -mb-px'
          : 'text-slate-500 hover:text-slate-800'"
        @click="activeTab = tab.id"
      >
        <span class="inline-flex items-center gap-2">
          <component :is="tab.icon" :size="16" />
          {{ tab.label }}
        </span>
      </button>
    </div>

    <div v-if="loading" class="bg-white rounded-2xl border border-slate-100 p-12 flex justify-center">
      <div class="size-10 rounded-full border-4 border-slate-200 border-t-[#0A66C2] animate-spin" />
    </div>

    <div v-else-if="loadError" class="bg-white rounded-2xl border border-rose-100 p-8 text-center">
      <p class="text-rose-600 text-sm font-medium">{{ loadError }}</p>
      <button class="mt-3 text-sm font-bold text-[#0A66C2]" @click="loadProfile">{{ $t('common.retry') }}</button>
    </div>

    <template v-else>
      <section v-show="activeTab === 'profile'" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100">
          <h2 class="font-bold text-slate-900">{{ $t('settings.profile.title') }}</h2>
          <p class="text-xs text-slate-400 mt-0.5">{{ $t('settings.profile.hint') }}</p>
        </div>

        <form class="p-6 space-y-6" @submit.prevent="saveProfile">
          <div class="flex items-center gap-5">
            <img
              :src="avatarPreview"
              alt="Avatar"
              class="size-20 rounded-2xl border-2 border-white shadow-md object-cover bg-slate-100"
            >
            <div class="space-y-2">
              <label class="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800">
                <Upload :size="14" />
                {{ $t('settings.profile.change_photo') }}
                <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onAvatarFile">
              </label>
              <p class="text-[11px] text-slate-400">{{ $t('settings.profile.photo_hint') }}</p>
              <p v-if="avatarUploading" class="text-[11px] text-[#0A66C2] font-medium">{{ $t('settings.profile.uploading') }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="block space-y-1.5">
              <span class="text-xs font-bold text-slate-600">{{ $t('settings.profile.first_name') }}</span>
              <input
                v-model="profileForm.firstName"
                type="text"
                required
                class="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
            </label>
            <label class="block space-y-1.5">
              <span class="text-xs font-bold text-slate-600">{{ $t('settings.profile.last_name') }}</span>
              <input
                v-model="profileForm.lastName"
                type="text"
                required
                class="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
            </label>
          </div>

          <label class="block space-y-1.5">
            <span class="text-xs font-bold text-slate-600">{{ $t('settings.profile.email') }}</span>
            <input
              :value="profile.email"
              type="email"
              disabled
              class="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
            >
            <span class="text-[11px] text-slate-400">{{ $t('settings.profile.email_locked') }}</span>
          </label>

          <p v-if="profileMsg" class="text-sm font-medium" :class="profileOk ? 'text-emerald-600' : 'text-rose-600'">
            {{ profileMsg }}
          </p>

          <button
            type="submit"
            class="h-11 px-6 rounded-full bg-[#0A66C2] text-white text-sm font-bold hover:bg-[#004182] disabled:opacity-50 inline-flex items-center gap-2"
            :disabled="profileSaving"
          >
            <Loader2 v-if="profileSaving" :size="16" class="animate-spin" />
            {{ $t('settings.profile.save') }}
          </button>
        </form>
      </section>

      <section v-show="activeTab === 'password'" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100">
          <h2 class="font-bold text-slate-900">{{ $t('settings.password.title') }}</h2>
          <p class="text-xs text-slate-400 mt-0.5">{{ $t('settings.password.hint') }}</p>
        </div>

        <div v-if="!profile.hasPassword" class="p-6">
          <div class="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
            {{ $t('settings.password.google_only') }}
          </div>
        </div>

        <form v-else class="p-6 space-y-4 max-w-md" @submit.prevent="savePassword">
          <label class="block space-y-1.5">
            <span class="text-xs font-bold text-slate-600">{{ $t('settings.password.current') }}</span>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              required
              autocomplete="current-password"
              class="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
          </label>
          <label class="block space-y-1.5">
            <span class="text-xs font-bold text-slate-600">{{ $t('settings.password.new') }}</span>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
          </label>
          <label class="block space-y-1.5">
            <span class="text-xs font-bold text-slate-600">{{ $t('settings.password.confirm') }}</span>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
          </label>

          <p v-if="passwordMsg" class="text-sm font-medium" :class="passwordOk ? 'text-emerald-600' : 'text-rose-600'">
            {{ passwordMsg }}
          </p>

          <button
            type="submit"
            class="h-11 px-6 rounded-full bg-[#0A66C2] text-white text-sm font-bold hover:bg-[#004182] disabled:opacity-50 inline-flex items-center gap-2"
            :disabled="passwordSaving"
          >
            <Loader2 v-if="passwordSaving" :size="16" class="animate-spin" />
            {{ $t('settings.password.save') }}
          </button>
        </form>
      </section>

      <section v-show="activeTab === 'security'" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100">
          <h2 class="font-bold text-slate-900">{{ $t('settings.security.title') }}</h2>
          <p class="text-xs text-slate-400 mt-0.5">{{ $t('settings.security.hint') }}</p>
        </div>

        <div class="divide-y divide-slate-100">
          <div class="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-bold text-slate-800">{{ $t('settings.security.email_verified') }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ $t('settings.security.email_verified_hint') }}</p>
            </div>
            <span
              class="px-3 py-1 rounded-full text-[11px] font-bold"
              :class="profile.emailVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
            >
              {{ profile.emailVerified ? $t('settings.security.verified') : $t('settings.security.not_verified') }}
            </span>
          </div>

          <div class="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-bold text-slate-800">{{ $t('settings.security.google') }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ $t('settings.security.google_hint') }}</p>
            </div>
            <span
              class="px-3 py-1 rounded-full text-[11px] font-bold"
              :class="profile.hasGoogle ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
            >
              {{ profile.hasGoogle ? $t('settings.security.enabled') : $t('settings.security.not_linked') }}
            </span>
          </div>

          <div class="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-bold text-slate-800">{{ $t('settings.security.local_password') }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ $t('settings.security.local_password_hint') }}</p>
            </div>
            <span
              class="px-3 py-1 rounded-full text-[11px] font-bold"
              :class="profile.hasPassword ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
            >
              {{ profile.hasPassword ? $t('settings.security.configured') : $t('settings.security.absent') }}
            </span>
          </div>

          <div class="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-bold text-slate-800">{{ $t('settings.security.login_alerts') }}</p>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ $t('settings.security.login_alerts_hint') }}
              </p>
            </div>
            <button
              type="button"
              class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
              :class="profile.loginAlerts ? 'bg-[#0A66C2]' : 'bg-slate-300'"
              :disabled="securitySaving"
              @click="toggleLoginAlerts"
            >
              <span
                class="pointer-events-none inline-block size-6 rounded-full bg-white shadow transition-transform"
                :class="profile.loginAlerts ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <div class="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-bold text-slate-800">{{ $t('settings.security.session') }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ $t('settings.security.session_hint') }}</p>
            </div>
            <button
              type="button"
              class="h-10 px-4 rounded-full border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50"
              @click="logoutHere"
            >
              {{ $t('settings.security.logout') }}
            </button>
          </div>
        </div>

        <p v-if="securityMsg" class="px-6 pb-5 text-sm font-medium" :class="securityOk ? 'text-emerald-600' : 'text-rose-600'">
          {{ securityMsg }}
        </p>
      </section>
    </template>
  </div>
</template>

<script setup>
import { User, Lock, Shield, Upload, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const localePath = useLocalePath()
const authStore = useAuthStore()
const token = useCookie('token')
const { t } = useI18n()

const tabs = computed(() => [
  { id: 'profile', label: t('settings.tabs.profile'), icon: User },
  { id: 'password', label: t('settings.tabs.password'), icon: Lock },
  { id: 'security', label: t('settings.tabs.security'), icon: Shield },
])

const activeTab = ref('profile')
const loading = ref(true)
const loadError = ref('')

const profile = ref({
  email: '',
  firstName: '',
  lastName: '',
  avatar: null,
  emailVerified: false,
  loginAlerts: true,
  hasPassword: true,
  hasGoogle: false,
})

const profileForm = reactive({ firstName: '', lastName: '', avatar: '' })
const profileSaving = ref(false)
const profileMsg = ref('')
const profileOk = ref(false)
const avatarUploading = ref(false)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordSaving = ref(false)
const passwordMsg = ref('')
const passwordOk = ref(false)

const securitySaving = ref(false)
const securityMsg = ref('')
const securityOk = ref(false)

const avatarPreview = computed(() => {
  if (profileForm.avatar) return profileForm.avatar
  const seed = profileForm.firstName || profile.value.email || 'user'
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
})

function authHeaders() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}

function applyUser(user) {
  profile.value = {
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatar: user.avatar || null,
    emailVerified: !!user.emailVerified,
    loginAlerts: user.loginAlerts !== false,
    hasPassword: user.hasPassword !== false,
    hasGoogle: !!user.hasGoogle,
  }
  profileForm.firstName = profile.value.firstName
  profileForm.lastName = profile.value.lastName
  profileForm.avatar = profile.value.avatar || ''
  authStore.user = {
    ...authStore.user,
    ...user,
    id: user.id ?? authStore.user?.id,
  }
}

async function loadProfile() {
  loading.value = true
  loadError.value = ''
  try {
    const { user } = await $fetch('/api/users/profile', { headers: authHeaders() })
    applyUser(user)
  } catch (e) {
    loadError.value = e?.data?.message || e?.message || t('common.error_generic')
  } finally {
    loading.value = false
  }
}

async function onAvatarFile(event) {
  const file = event.target?.files?.[0]
  if (!file) return
  avatarUploading.value = true
  profileMsg.value = ''
  try {
    const body = new FormData()
    body.append('file', file)
    const res = await $fetch('/api/upload', {
      method: 'POST',
      body,
      headers: authHeaders(),
    })
    profileForm.avatar = res.url
  } catch (e) {
    profileOk.value = false
    profileMsg.value = e?.data?.message || e?.message || t('common.error_generic')
  } finally {
    avatarUploading.value = false
    event.target.value = ''
  }
}

async function saveProfile() {
  profileSaving.value = true
  profileMsg.value = ''
  try {
    const res = await $fetch('/api/users/profile', {
      method: 'PUT',
      headers: authHeaders(),
      body: {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        avatar: profileForm.avatar || null,
      },
    })
    applyUser(res.user)
    profileOk.value = true
    profileMsg.value = res.message || t('settings.profile.save')
  } catch (e) {
    profileOk.value = false
    profileMsg.value = e?.data?.message || e?.message || t('common.error_generic')
  } finally {
    profileSaving.value = false
  }
}

async function savePassword() {
  passwordSaving.value = true
  passwordMsg.value = ''
  try {
    const res = await $fetch('/api/users/me/password', {
      method: 'PUT',
      headers: authHeaders(),
      body: { ...passwordForm },
    })
    passwordOk.value = true
    passwordMsg.value = res.message || t('settings.password.save')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (e) {
    passwordOk.value = false
    passwordMsg.value = e?.data?.message || e?.message || t('common.error_generic')
  } finally {
    passwordSaving.value = false
  }
}

async function toggleLoginAlerts() {
  securitySaving.value = true
  securityMsg.value = ''
  const next = !profile.value.loginAlerts
  try {
    const res = await $fetch('/api/users/profile', {
      method: 'PUT',
      headers: authHeaders(),
      body: { loginAlerts: next },
    })
    applyUser(res.user)
    securityOk.value = true
    securityMsg.value = next
      ? t('settings.security.alerts_on')
      : t('settings.security.alerts_off')
  } catch (e) {
    securityOk.value = false
    securityMsg.value = e?.data?.message || e?.message || t('common.error_generic')
  } finally {
    securitySaving.value = false
  }
}

function logoutHere() {
  authStore.logout()
  navigateTo(localePath('/auth/login'))
}

onMounted(() => {
  const tab = String(route.query.tab || '')
  if (tabs.value.some(item => item.id === tab)) activeTab.value = tab
  loadProfile()
})

watch(activeTab, (id) => {
  navigateTo({ path: localePath('/settings'), query: { tab: id } }, { replace: true })
})
</script>
