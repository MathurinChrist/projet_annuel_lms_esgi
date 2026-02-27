<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div class="w-full max-w-md bg-white rounded-[24px] shadow-xl shadow-blue-500/5 border border-slate-100 p-8 md:p-10">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl text-white mb-6">
          <GraduationCap :size="32" />
        </div>
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Bon retour !</h1>
        <p class="text-slate-500">Veuillez entrer vos identifiants pour vous connecter.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
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

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-slate-700">Mot de passe</label>
            <a href="#" class="text-xs font-semibold text-blue-600 hover:text-blue-700">Mot de passe oublié ?</a>
          </div>
          <input 
            v-model="password"
            type="password" 
            class="auth-input" 
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading">Connexion...</span>
          <span v-else>Se connecter</span>
          <ArrowRight v-if="!loading" :size="18" />
        </button>
      </form>

      <div class="mt-10 pt-8 border-t border-slate-100 text-center">
        <p class="text-sm text-slate-500">
          Pas encore de compte ? 
          <NuxtLink to="/auth/register" class="font-bold text-blue-600 hover:text-blue-700 ml-1">Créer un compte</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { GraduationCap, ArrowRight } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';

definePageMeta({
  layout: false
});

const email = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);

const handleLogin = async () => {
  const success = await authStore.login({
    email: email.value,
    password: password.value,
  });
  
  if (success) {
    router.push('/');
  }
};
</script>
