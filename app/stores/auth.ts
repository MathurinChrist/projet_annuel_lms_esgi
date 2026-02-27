import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null, // In Nuxt, we can use useCookie for SSR friendliness
        loading: false,
        error: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        async login(credentials) {
            this.loading = true;
            this.error = null;
            try {
                const data = await $fetch('/api/auth/login', {
                    method: 'POST',
                    body: credentials
                });
                this.token = data.token;
                this.user = data.user;

                // Set cookie for persistence/SSR
                const tokenCookie = useCookie('token');
                tokenCookie.value = data.token;

                return true;
            } catch (err) {
                this.error = err.data?.message || 'Connexion échouée';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async register(userData) {
            this.loading = true;
            this.error = null;
            try {
                await $fetch('/api/auth/register', {
                    method: 'POST',
                    body: userData
                });
                return true;
            } catch (err) {
                this.error = err.data?.message || 'Inscription échouée';
                return false;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.user = null;
            this.token = null;
            const tokenCookie = useCookie('token');
            tokenCookie.value = null;
        }
    },
});
