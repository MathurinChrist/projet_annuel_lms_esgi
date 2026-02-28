<template>
  <div class="w-full max-w-md bg-white rounded-[24px] shadow-xl shadow-blue-500/5 border border-slate-100 p-8 md:p-10">
    <div class="text-center mb-10">
      <div class="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl text-white mb-6">
        <GraduationCap :size="32" />
      </div>
      <h1 class="text-2xl font-bold text-slate-900 mb-2">Créer un compte</h1>
      <p class="text-slate-500">Rejoignez notre communauté d'apprenants dès aujourd'hui.</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-5">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
          <input 
            v-model="firstName"
            type="text" 
            class="auth-input" 
            placeholder="Alex"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Nom</label>
          <input 
            v-model="lastName"
            type="text" 
            class="auth-input" 
            placeholder="Rivera"
            required
          />
        </div>
      </div>

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
        <label class="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
        <input 
          v-model="password"
          type="password" 
          class="auth-input" 
          placeholder="••••••••"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Rôle</label>
        <select v-model="role" class="auth-input appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C/path%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat">
          <option value="APPRENANT">Apprenant</option>
          <option value="FORMATEUR">Formateur</option>
        </select>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
        {{ error }}
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading">Création du compte...</span>
        <span v-else>Commencer</span>
        <ArrowRight v-if="!loading" :size="18" />
      </button>
    </form>

    <div class="relative my-8">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-slate-200"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-white text-slate-400">ou continuer avec</span>
      </div>
    </div>

    <a href="/api/auth/google" class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-slate-700 font-medium">
      <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
      Google
    </a>

    <div class="mt-10 pt-8 border-t border-slate-100 text-center">
      <p class="text-sm text-slate-500">
        Vous avez déjà un compte ? 
        <NuxtLink to="/auth/login" class="font-bold text-blue-600 hover:text-blue-700 ml-1">Se connecter</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { GraduationCap, ArrowRight } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';

definePageMeta({
  layout: 'auth'
});

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const role = ref('APPRENANT');
const router = useRouter();
const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);

const handleRegister = async () => {
  const success = await authStore.register({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value,
    role: role.value,
  });
  
  if (success) {
    router.push('/auth/login');
  }
};
</script>
