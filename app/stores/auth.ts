import { defineStore } from 'pinia';

interface AuthUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    [key: string]: unknown;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        token: null,
        loading: false,
        error: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        async login(credentials: { email: string; password: string }) {
            this.loading = true;
            this.error = null;
            try {
                const data = await $fetch<{ token: string; user: AuthUser }>('/api/auth/login', {
                    method: 'POST',
                    body: credentials
                });
                this.token = data.token;
                this.user = data.user;

                const tokenCookie = useCookie('token');
                tokenCookie.value = data.token;

                return true;
            } catch (err: any) {
                this.error = err.data?.message || 'Connexion échouée';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async register(userData: { firstName: string; lastName: string; email: string; password: string; role: string }) {
            this.loading = true;
            this.error = null;
            try {
                await $fetch('/api/auth/register', {
                    method: 'POST',
                    body: userData
                });
                return true;
            } catch (err: any) {
                this.error = err.data?.message || 'Inscription échouée';
                return false;
            } finally {
                this.loading = false;
            }
        },

        setTokenFromGoogle(token: string) {
            this.token = token;
            const tokenCookie = useCookie('token');
            tokenCookie.value = token;

            try {
                const parts = token.split('.');
                if (parts[1]) {
                    const payload = JSON.parse(atob(parts[1]));
                    this.user = {
                        id: payload.id || payload.sub,
                        email: payload.email,
                        firstName: payload.firstName,
                        lastName: payload.lastName,
                        role: payload.role,
                    };
                }
            } catch {
                this.user = null;
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
