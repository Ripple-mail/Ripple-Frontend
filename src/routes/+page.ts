// src/routes/+page.ts
import { redirect } from '@sveltejs/kit';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { api } from '$lib/api';
import type { Email } from '$lib/types';

export const load: PageLoad = async () => {
	const currentUser = get(user);

	if (!currentUser) {
		throw redirect(307, '/login');
	}

	try {
		const response = (await api.get('/emails')) as { data: { emails: Email }[] };
		const emails: Email[] = response.data.map((item) => item.emails);

		return {
			emails
		};
	} catch (error) {
		console.error('Failed to fetch emails:', error);
		return {
			emails: []
		};
	}
};
