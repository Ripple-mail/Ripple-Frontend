<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { notice } from '$lib/stores/notice';

	let { children, data } = $props();

	async function logout() {
		auth.logout();
		await goto('/');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.initialized}
	<header>
		<nav>
			{#if $auth.user}
				<a href="/inbox">Inbox</a>
				<a href="/compose">Compose</a>
				<button onclick={logout}>Logout</button>
			{:else}
				<a href="/login">Login</a>
				<a href="/register">Register</a>
			{/if}
		</nav>
	</header>

	{#if $notice}
		<div class="notice">
			{$notice}
		</div>
	{/if}

	<main>
		{@render children?.()}
	</main>
{/if}

<style>
	.notice {
		background: #ffefc1;
		color: #333;
		padding: 1rem;
		border: 1px solid #e0c97f;
		margin-bottom: 1rem;
		border-radius: 4px;
	}
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
