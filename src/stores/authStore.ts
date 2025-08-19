import { router } from '@inertiajs/react';
import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            publicKey: null,
            user: null,
            isLoading: false,
            error: null,
            isInitialized: false,

            initialize: async () => {
                if (get().isInitialized || get().isLoading) return;

                set({ isLoading: true });
                try {
                    const storedToken = get().token;
                    if (storedToken) {
                        await get().fetchUser();
                        set({ isInitialized: true });
                        return;
                    }

                    await get().getTokenFromSession();
                } catch (error) {
                    console.log('Auto-login failed, user not authenticated');
                } finally {
                    set({ isLoading: false, isInitialized: true });
                }
            },

            login: async (email, password, deviceId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post('/jwt/login', {
                        email,
                        password,
                        device_id: deviceId || crypto.randomUUID(),
                    });

                    set({
                        token: response.data.data.token,
                        publicKey: response.data.data.public_key,
                        isLoading: false,
                        isInitialized: true,
                    });

                    await get().fetchUser();
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Login failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (name, email, password, deviceId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post('/jwt/register', {
                        name,
                        email,
                        password,
                        password_confirmation: password,
                        device_id: deviceId || crypto.randomUUID(),
                    });

                    set({
                        token: response.data.data.token,
                        publicKey: response.data.data.public_key,
                        user: response.data.data.user,
                        isLoading: false,
                        isInitialized: true,
                    });
                } catch (error: any) {
                    set({
                        error:
                            error.response?.data?.message ||
                            'Registration failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    const token = get().token;
                    if (token) {
                        await axios.post(
                            '/jwt/logout',
                            {},
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            },
                        );
                    }
                } finally {
                    set({
                        token: null,
                        publicKey: null,
                        user: null,
                        isInitialized: true,
                    });
                    router.visit('/login');
                }
            },

            fetchUser: async () => {
                const fullToken = get().token;
                if (!fullToken) return;

                const jwtToken = fullToken.split(':')[1];

                try {
                    const response = await axios.get('/jwt/user', {
                        headers: { Authorization: `Bearer ${jwtToken}` },
                    });
                    set({ user: response.data.data });
                } catch (error) {
                    if (
                        axios.isAxiosError(error) &&
                        error.response?.status === 401
                    ) {
                        set({ token: null, publicKey: null, user: null });
                    }
                    throw error;
                }
            },

            verifySignature: async (data: string, signature: string) => {
                try {
                    if (!get().token) return false;

                    const response = await axios.post(
                        '/jwt/verify-signature',
                        {
                            token: get().token,
                            data,
                            signature,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${get().token}`,
                            },
                        },
                    );

                    return response.data.status === 'success';
                } catch {
                    return false;
                }
            },

            getTokenFromSession: async () => {
                set({ isLoading: true });
                try {
                    const response = await axios.get('/jwt/token');
                    if (response.data.data?.token) {
                        set({
                            token: response.data.data.token,
                            publicKey: response.data.data.public_key,
                        });
                        await get().fetchUser();
                    }
                } catch (error) {
                    // pas d’erreur levée si pas connecté en session
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'jwt-auth-storage',
            partialize: (state) => ({
                token: state.token,
                publicKey: state.publicKey,
                user: state.user,
            }),
        },
    ),
);