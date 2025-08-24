import { browser } from '$app/environment';

const BASE_URL = 'http://localhost:3001/api';

async function request<T>(method: string, path: string, data?: unknown): Promise<T> {
	const opts: RequestInit & { headers: Record<string, string> } = {
		method,
		headers: {}
	};

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	if (browser) {
		opts.credentials = 'include';
	}

	const res = await fetch(`${BASE_URL}${path}`, opts);
	const json = await res.json();

	if (res.ok) {
		return json as T;
	}

	throw new Error(json.error || 'API request failed');
}

export const api = {
	get: <T>(path: string) => request<T>('GET', path),
	post: <T>(path: string, data: unknown) => request<T>('POST', path, data),
	put: <T>(path: string, data: unknown) => request<T>('PUT', path, data),
	delete: <T>(path: string) => request<T>('DELETE', path)
};
