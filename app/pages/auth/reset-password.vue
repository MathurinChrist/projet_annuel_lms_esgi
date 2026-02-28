<template>
  <div class="w-full max-w-md bg-white rounded-[24px] shadow-xl shadow-blue-500/5 border border-slate-100 p-8 md:p-10">
    <div class="text-center mb-10">
      <div class="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl text-white mb-6">
        <LockKeyhole :size="32" />
      </div>
      <h1 class="text-2xl font-bold text-slate-900 mb-2">Nouveau mot de passe</h1>
      <p class="text-slate-500">Choisissez un nouveau mot de passe sécurisé.</p>
    </div>

    <!-- Pas de token -->
    <div v-if="!token" class="text-center">
      <div class="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl mb-6">
        Lien invalide ou expiré. Veuillez refaire une demande de réinitialisation.
      </div>
      <NuxtLink to="/auth/forgot-password" class="font-bold text-blue-600 hover:text-blue-700 text-sm">
        Demander un nouveau lien
      </NuxtLink>
    </div>

    <!-- Succès -->
    <div v-else-if="success" class="text-center">
      <div class="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl mb-6">
        Votre mot de passe a été réinitialisé avec succès.
      </div>
      <NuxtLink to="/auth/login" class="font-bold text-blue-600 hover:text-blue-700 text-sm">
        Se connecter
      </NuxtLink>
    </div>

    <!-- Formulaire -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Nouveau mot de passe</label>
        <input
          v-model="password"
          type="password"
          class="auth-input"
          placeholder="••••••••"
          required
          minlength="8"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Confirmer le mot de passe</label>
        <input
          v-model="confirmPassword"
          type="password"
          class="auth-input"
          placeholder="••••••••"
          required
          minlength="8"
        />
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
        {{ error }}
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading">Réinitialisation...</span>
        <span v-else>Réinitialiser</span>
        <Check v-if="!loading" :size="18" />
      </button>
    </form>

    <div class="mt-10 pt-8 border-t border-slate-100 text-center">
      <p class="text-sm text-slate-500">
        Retour à la
        <NuxtLink to="/auth/login" class="font-bold text-blue-600 hover:text-blue-700 ml-1">page de connexion</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { LockKeyhole, Check } from 'lucide-vue-next';

definePageMeta({
  layout: 'auth'
});

const route = useRoute();
const token = computed(() => route.query.token);

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

const handleSubmit = async () => {
  error.value = '';

  if (password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas.';
    return;
  }

  loading.value = true;

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, password: password.value },
    });
    success.value = true;
  } catch (e) {
    error.value = e?.data?.message || 'Le lien est invalide ou a expiré. Veuillez refaire une demande.';
  } finally {
    loading.value = false;
  }
};
</script>
