<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { user } from '$lib/stores/user';
	import { goto } from '$app/navigation';

	onMount(async () => {
		if (!$user) {
			try {
				const response = (await api.get('/profile')) as {
					status: string;
					user?: import('$lib/stores/user').JwtUser;
				};
				if (response.status === 'success' && response.user) {
					user.set(response.user);
				}
			} catch {
				console.error('Not logged in');
				user.set(null);
			}
		}
	});

	async function logout() {
		try {
			await api.post('/logout', {});
		} catch (e) {
			console.error('Logout failed, proceeding to clear state.', e);
		} finally {
			user.set(null);
			await goto('/login');
		}
	}

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<nav>
		{#if $user}
			<span>Welcome, {$user.username}!</span>
			<button onclick={logout}>Logout</button>
		{:else}
			<a href="/login">Login</a>
			<a href="/register">Register</a>
		{/if}
	</nav>
</header>

<main>
	{@render children?.()}
</main>

<style>
	header {
		padding: 1rem;
		border-bottom: 1px solid #ccc;
	}
	nav {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
</style>
