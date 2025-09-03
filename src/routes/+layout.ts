import { auth } from '$lib/stores/auth';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	if (browser) {
		await auth.initialize();
	}
	return {
		initialized: true
	};
};
