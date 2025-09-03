import { api } from '$lib/api';
import type { UserEmail } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	try {
		const response = (await api.get(`/emails/${params.id}`)) as { data: UserEmail };
		return {
			email: response.data
		};
	} catch (error) {
		console.error('Failed to fetch email:', error);
		return {
			email: null,
			error: error instanceof Error ? error.message : 'Failed to load email.'
		};
	}
};