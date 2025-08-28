import { writable } from 'svelte/store';
import { browser } from '$app/environment';

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
    setUser: (user: JwtUser) => {
        set({
            user,
            token: browser ? window.localStorage.getItem('jwt') : null
        });
    }
};