<script lang="ts">
	import { api } from '$lib/api';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';

	let identifier = '';
	let password = '';
	let error = '';

	interface LoginResponse {
		status: string;
		error?: string;
	}
	interface ProfileResponse {
		status: string;
		user?: import('$lib/stores/user').JwtUser;
	}

	async function login() {
		error = '';
		try {
			const response = (await api.post('/login', { identifier, password })) as LoginResponse;
			if (response.status === 'success') {
				try {
					const profile = (await api.get('/profile')) as ProfileResponse;
					if (profile.status === 'success' && profile.user) {
						user.set(profile.user);
					} else {
						user.set(null);
					}
				} catch {
					user.set(null);
				}
				await goto('/');
			} else {
				error = response.error || 'An unexpected error occurred.';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'An unexpected error occurred.';
		}
	}
</script>

<h1>Login</h1>

<form on:submit|preventDefault={login}>
	<label>
		Email
		<input type="text" bind:value={identifier} />
	</label>
	<label>
		Password
		<input type="password" bind:value={password} />
	</label>
	<button type="submit">Login</button>
</form>

{#if error}
	<p style="color: red;">{error}</p>
{/if}
