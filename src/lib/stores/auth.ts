import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { api } from '$lib/api';

export interface JwtUser {
    id: number;
    email: string;
    username: string;
}

interface AuthState {
    user: JwtUser | null;
    token: string | null;
}

const initialValue: AuthState = {
    user: null,
    token: browser ? window.localStorage.getItem('jwt') : null
};

const { subscribe, set } = writable<AuthState>(initialValue);

export const auth = {
    subscribe,
    login: (user: JwtUser, token: string) => {
        if (browser) {
            window.localStorage.setItem('jwt', token);
        }
        set({ user, token });
    },
    logout: () => {
        if (browser) {
            window.localStorage.removeItem('jwt');
        }
        set({ user: null, token: null });
    },
    initialize: async () => {
        const token = window.localStorage.getItem('jwt');
        if (token) {
            try {
                const response = (await api.get('/profile')) as { user: JwtUser };
                if (response.user) {
                    set({ user: response.user, token });
                } else {
                    auth.logout();
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                auth.logout();
            }
        }
    }
};

if (browser) {
    auth.initialize();
}