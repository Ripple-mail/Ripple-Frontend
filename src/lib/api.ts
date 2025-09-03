import { browser } from '$app/environment';
import { auth } from '$lib/stores/auth';
import { get } from 'svelte/store';

const BASE_URL = 'http://localhost:3001/api';

async function request<T>(method: string, path: string, data?: unknown): Promise<T> {
	const { token } = get(auth);

	const opts: RequestInit & { headers: Record<string, string> } = {
		method,
		headers: {}
	};

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	if (token) {
		opts.headers['Authorization'] = `Bearer ${token}`;
	}

	if (browser) {
		opts.credentials = 'include';
	}

	const res = await fetch(`${BASE_URL}${path}`, opts);
	const json = await res.json();

	if (res.ok) {
		return json as T;
	}

	if (res.status === 401) {
		auth.logout();
		if (browser) {
			window.location.href = '/login';
		}
	}

	throw new Error(json.error || 'API request failed');
}

export const api = {
	get: <T>(path: string) => request<T>('GET', path),
	post: <T>(path: string, data: unknown) => request<T>('POST', path, data),
	put: <T>(path: string, data: unknown) => request<T>('PUT', path, data),
	delete: <T>(path: string) => request<T>('DELETE', path)
};
