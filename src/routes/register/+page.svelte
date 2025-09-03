<script lang="ts">
	import { api } from '$lib/api';
	import { goto } from '$app/navigation';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let success = $state('');

	let emailError = $state('');

	const emailRegex = /^[^~]+~[^~]+$/;

	interface RegisterResponse {
		status: string;
		error?: string;
	}

	async function register(event: SubmitEvent) {
		event.preventDefault();

		if (!emailRegex.test(email)) {
			emailError = 'Email must be in the format username~domain.com (use a tilde ~ instead of @)';
			return;
		}

		try {
			const response = (await api.post('/register', {
				username,
				email,
				password
			})) as RegisterResponse;
			if (response.status === 'success') {
				success = 'Registration successful! Redirecting to login...';
				setTimeout(() => goto('/login'), 2000);
			} else {
				error = response.error || 'An unexpected error occurred.';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'An unexpected error occurred.';
		}
	}
</script>

<h1>Register</h1>

<form onsubmit={register}>
	<label>
		Username
		<input type="text" bind:value={username} required />
	</label>
	<label>
		Email
		<input
			type="text"
			bind:value={email}
			required
			placeholder="username~domain.com"
			oninput={() => {
				emailError = emailRegex.test(email)
					? ''
					: 'Email must be in the format username~domain.com (use a tilde ~ instead of @)';
			}}
			aria-describedby="emailHelp"
		/>
		<small id="emailHelp" style="color: #888; display: block;">
			Please enter your email in the format <b>username~domain.com</b> (use <b>~</b> instead of
			<b>@</b>).
		</small>
		{#if emailError}
			<span style="color: red;">{emailError}</span>
		{/if}
	</label>
	<label>
		Password
		<input type="password" bind:value={password} required />
	</label>
	<button type="submit" disabled={!!emailError}>Register</button>
</form>

{#if error}
	<p style="color: red;">{error}</p>
{/if}

{#if success}
	<p style="color: green;">{success}</p>
{/if}
