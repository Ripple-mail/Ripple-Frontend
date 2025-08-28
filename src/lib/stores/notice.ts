import { writable } from 'svelte/store';

export const notice = writable<string | null>(null);