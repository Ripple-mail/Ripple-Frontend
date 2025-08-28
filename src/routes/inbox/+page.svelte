<script lang="ts">
	import { api } from '$lib/api';
	import type { Email } from '$lib/types';
	import { notice } from '$lib/stores/notice';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let emails: Email[] = $state([]);
	let isLoading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let timeout: number;

	async function fetchEmails() {
		isLoading = true;
		error = '';
		try {
			const response = (await api.get('/emails')) as { data: { emails: Email }[] };
			emails = response.data.map((item) => item.emails);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to fetch emails.';
			// I feel like keeping this as redundancy for the same code in `+layout.svelte`
            // Maybe I'll remove it when cleaning up
			if (error.includes('Invalid token')) {
				notice.set('Your session has expired. Please log in again.');
				await goto('/login');
			}
		} finally {
			isLoading = false;
		}
	}

	async function searchEmails() {
		isLoading = true;
		error = '';
		try {
			const response = (await api.get(`/emails?query=${searchTerm}`)) as { data: Email[] };
			emails = response.data;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to search emails.';
		} finally {
			isLoading = false;
		}
	}

	function onSearchInput() {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			if (searchTerm) {
				searchEmails();
			} else {
				fetchEmails();
			}
		}, 500);
	}

	onMount(fetchEmails);
</script>

<div class="inbox-container">
	<h1>Inbox</h1>

	<input
		type="search"
		bind:value={searchTerm}
		oninput={onSearchInput}
		placeholder="Search emails..."
	/>

	{#if isLoading}
		<p>Loading emails...</p>
	{:else if error}
		<p class="error">{error}</p>
	{:else if emails.length === 0}
		<p>Your inbox is empty.</p>
	{:else}
		<ul>
			{#each emails as email (email.id)}
				<li>
					<strong>From:</strong>
					{email.from_address || 'N/A'} <br />
					<strong>Subject:</strong>
					{email.subject || '(no subject)'}
					<p>{email.body_text?.substring(0, 100) || ''}...</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.inbox-container {
		padding: 1rem;
	}
	.error {
		color: red;
	}
	li {
		list-style-type: none;
		padding: 0.5rem;
		border-bottom: 1px solid #eee;
	}
</style>
