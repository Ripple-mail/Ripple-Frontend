import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/stores/auth';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { browser } from '$app/environment';

export const load: PageLoad = async ({ url, parent }) => {
	await parent();
	if (browser) {
		const { user } = get(auth);

		if (!user) {
			throw redirect(307, '/login');
		}
	}

	const mailboxId = url.searchParams.get('mailboxId');

	return {
		mailboxId: mailboxId ? parseInt(mailboxId, 10) : null
	};
};
