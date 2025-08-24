import { writable } from 'svelte/store';

export interface JwtUser {
	id: number;
	email: string;
	username: string;
}

export const user = writable<JwtUser | null>(null);
