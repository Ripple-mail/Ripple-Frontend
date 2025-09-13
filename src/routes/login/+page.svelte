<script lang="ts">
	import { api } from '$lib/api';
	import { goto } from '$app/navigation';
	import { auth, type JwtUser } from '$lib/stores/auth';

	let identifier = $state('');
	let password = $state('');
	let error = $state('');

	interface LoginResponse {
		status: 'success' | 'error' | 'mfa_required';
		error?: string;
		token?: string;
	}

	interface ProfileResponse {
		status: string;
		user?: JwtUser;
	}

    function getDeviceFingerprint() {
        const { userAgent, language, platform } = navigator;
        const screenSize = `${screen.width}x${screen.height}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        return `${userAgent}|${language}|${platform}|${screenSize}|${timezone}`;
    }

    async function hashFingerprint(fingerprint: string) {
        const encoder = new TextEncoder();
        const data = encoder.encode(fingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

	async function login(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		try {
            const deviceFingerprint = await hashFingerprint(getDeviceFingerprint());
			const response = (await api.post('/login', { identifier, password, deviceFingerprint })) as LoginResponse;
			if (response.status === 'success' && response.token) {
				const profile = (await api.get('/profile')) as ProfileResponse;
				if (profile.status === 'success' && profile.user) {
					auth.login(profile.user, response.token);
					await goto('/inbox');
				} else {
					error = 'Failed to fetch user profile.';
				}
			} else {
				error = response.error || 'An unexpected error occurred.';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'An unexpected error occurred.';
		}
	}
</script>

<div class="login-container">
	<h1>Login</h1>

	<form onsubmit={login}>
		<label>
			Email or Username
			<input type="text" bind:value={identifier} required />
		</label>
		<label>
			Password
			<input type="password" bind:value={password} required />
		</label>
		<button type="submit">Login</button>
	</form>

	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>

<style>
	.login-container {
		max-width: 400px;
		margin: 2rem auto;
		padding: 2rem;
		border: 1px solid #ccc;
		border-radius: 8px;
	}

	form {
		display: flex;
		flex-direction: column;
	}

	label {
		margin-bottom: 0.5rem;
	}

	.error {
		color: red;
	}
</style>
