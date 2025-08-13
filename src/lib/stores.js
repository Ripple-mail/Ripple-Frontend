import { writable } from 'svelte/store';

/**
 * Creates a persistent store in localStorage
 * @param {string} key - The name of the localStorage item
 * @param {any} startValue - The default value of the store.
*/
function createPersistedStore(key, startValue) {
    const storedValue = localStorage.getItem(key);
    const store = writable(storedValue ? JSON.parse(storedValue) : startValue);
    
    store.subscribe(value => {
        localStorage.setItem(key, JSON.stringify(value));
    });

    return store;
}

export const isLoggedInStore = createPersistedStore('isLoggedIn', false);

export const userStore = createPersistedStore('user', null);

export const paneWidthStore = createPersistedStore('paneWidth', null);

export const settingsStore = createPersistedStore('settings', { notifications: false, theme: 'system' });