// src/stores/authStore.ts
import { router } from '@inertiajs/react';
import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultAuthConfig } from '../config/authConfig';
export const createAuthStore = (config = defaultAuthConfig) => {
    const api = axios.create({
        baseURL: config.baseURL,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    return create()(persist((set, get) => ({
        token: null,
        user: null,
        isLoading: false,
        error: null,
        isInitialized: false,
        initialize: async () => {
            const { isInitialized, token } = get();
            if (isInitialized)
                return;
            set({ isLoading: true });
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    await get().fetchUser();
                }
                catch (e) {
                    console.error('Échec de récupération de l’utilisateur à l’initialisation', e);
                    set({ token: null, user: null });
                    delete api.defaults.headers.common['Authorization'];
                }
            }
            set({ isLoading: false, isInitialized: true });
        },
        login: async (email, password, deviceId) => {
            set({ isLoading: true, error: null });
            try {
                const response = await api.post(config.routes.login, {
                    email,
                    password,
                    device_id: deviceId || crypto.randomUUID(),
                });
                const token = response.data.token || response.data.data?.token;
                if (!token)
                    throw new Error('Token not returned');
                set({ token });
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                await get().fetchUser();
            }
            catch (error) {
                set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
                throw error;
            }
            finally {
                set({ isLoading: false });
            }
        },
        register: async (name, email, password, deviceId) => {
            set({ isLoading: true, error: null });
            try {
                const response = await api.post(config.routes.register, {
                    name,
                    email,
                    password,
                    password_confirmation: password,
                    device_id: deviceId || crypto.randomUUID(),
                });
                const { token, user } = response.data.data || response.data;
                if (!token || !user)
                    throw new Error('Token or user not returned');
                set({ token, user });
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return user;
            }
            catch (error) {
                set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
                throw error;
            }
            finally {
                set({ isLoading: false });
            }
        },
        logout: async () => {
            const token = get().token;
            set({ token: null, user: null });
            delete api.defaults.headers.common['Authorization'];
            try {
                if (token)
                    await api.post(config.routes.logout);
            }
            catch (e) {
                console.error('Échec de la déconnexion sur le serveur', e);
            }
            finally {
                router.visit('/login');
            }
        },
        fetchUser: async () => {
            const { token } = get();
            if (!token) {
                set({ user: null });
                return;
            }
            try {
                const response = await api.get(config.routes.fetchUser);
                set({ user: response.data.user || response.data.data });
            }
            catch (error) {
                if (error.response?.status === 401) {
                    set({ token: null, user: null });
                    delete api.defaults.headers.common['Authorization'];
                    router.visit('/login');
                }
                throw error;
            }
        },
        refreshToken: async () => {
            const { token } = get();
            if (!token)
                return;
            set({ isLoading: true });
            try {
                const response = await api.post(config.routes.refreshToken);
                const newToken = response.data.token || response.data.data?.token;
                if (newToken) {
                    set({ token: newToken });
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                }
            }
            catch (error) {
                console.error('Token refresh failed', error);
                set({ token: null, user: null });
                delete api.defaults.headers.common['Authorization'];
                router.visit('/login');
            }
            finally {
                set({ isLoading: false });
            }
        },
    }), {
        name: 'jwt-auth-storage',
        partialize: (state) => ({ token: state.token }),
    }));
};
// Export du store avec la config par défaut
export const useAuthStore = createAuthStore();
