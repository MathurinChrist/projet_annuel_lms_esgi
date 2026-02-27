<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div class="w-full max-w-md bg-white rounded-[24px] shadow-xl shadow-blue-500/5 border border-slate-100 p-8 md:p-10">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl text-white mb-6">
          <GraduationCap :size="32" />
        </div>
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Créer un compte</h1>
        <p class="text-slate-500">Rejoignez notre communauté d'apprenants dès aujourd'hui.</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Nom complet</label>
          <input 
            v-model="name"
            type="text" 
            class="auth-input" 
            placeholder="Alex Rivera"
            required
          />
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

      <div class="mt-10 pt-8 border-t border-slate-100 text-center">
        <p class="text-sm text-slate-500">
          Vous avez déjà un compte ? 
          <NuxtLink to="/auth/login" class="font-bold text-blue-600 hover:text-blue-700 ml-1">Se connecter</NuxtLink>
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

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('APPRENANT');
const router = useRouter();
const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);

const handleRegister = async () => {
  const success = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
    role: role.value,
  });
  
  if (success) {
    router.push('/auth/login');
  }
};
</script>
