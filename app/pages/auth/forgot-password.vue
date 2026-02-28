<template>
  <div class="w-full max-w-md bg-white rounded-[24px] shadow-xl shadow-blue-500/5 border border-slate-100 p-8 md:p-10">
    <div class="text-center mb-10">
      <div class="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl text-white mb-6">
        <KeyRound :size="32" />
      </div>
      <h1 class="text-2xl font-bold text-slate-900 mb-2">Mot de passe oublié</h1>
      <p class="text-slate-500">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
    </div>

    <div v-if="success" class="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl mb-6">
      Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.
    </div>

    <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Adresse Email</label>
        <input
          v-model="email"
          type="email"
          class="auth-input"
          placeholder="alex@rivera.com"
          required
        />
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
        {{ error }}
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading">Envoi en cours...</span>
        <span v-else>Envoyer le lien</span>
        <Send v-if="!loading" :size="18" />
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
import { KeyRound, Send } from 'lucide-vue-next';

definePageMeta({
  layout: 'auth'
});

const email = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    });
    success.value = true;
  } catch (e) {
    error.value = e?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    loading.value = false;
  }
};
</script>
