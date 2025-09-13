<script lang="ts">
	import { api } from '$lib/api';
	import type { UserEmail, Email, Mailbox } from '$lib/types';
	import { notice } from '$lib/stores/notice';
	import { goto } from '$app/navigation';
	import Mailboxes from '$lib/components/Mailboxes.svelte';

	let {
		data
	}: {
		data: {
			mailboxId: number | null;
		};
	} = $props();

	let emails: (Email & UserEmail)[] = $state([]);
	let isLoading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let timeout: number;

	async function fetchEmails(mailboxId: number | null) {
		isLoading = true;
		error = '';
		try {
			const url = mailboxId ? `/emails?mailboxId=${mailboxId}` : '/emails';
			const response = (await api.get(url)) as {
				data: any[];
			};

			emails = response.data.map(({ email, ...rest }) => ({
				...email,
				...rest
			}));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to fetch emails.';
			if (error.includes('Invalid token')) {
				notice.set('Your session has expired. Please log in again.');
				await goto('/login');
			}
		} finally {
			isLoading = false;
		}
	}

	async function searchEmails(mailboxId: number | null) {
		isLoading = true;
		error = '';
		try {
			let url = `/emails?query=${searchTerm}`;
			if (mailboxId) {
				url += `&mailboxId=${mailboxId}`;
			}
			const response = (await api.get(url)) as {
				data: any[];
			};
			emails = response.data.map(({ email, ...rest}) => {
				return {
					...email,
                    ...rest
				};
			});
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
				searchEmails(data.mailboxId);
			} else {
				fetchEmails(data.mailboxId);
			}
		}, 500);
	}

	$effect(() => {
		fetchEmails(data.mailboxId);
	});
</script>

<div class="inbox-layout">
	<aside>
		<Mailboxes />
	</aside>

	<main class="inbox-container">
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
			<p>This mailbox is empty.</p>
		{:else}
			<ul>
				{#each emails as email}
					<li class:unread={!email.isRead} class:read={email.isRead}>
						<a href={`/email/${email.emailId}`} class="email-link">
							<div class="email-row">
								<span class="read-indicator" title={email.isRead ? 'Read' : 'Unread'}></span>
								{#if email.isSender ?? false}
									<strong>To:</strong>
									{Array.isArray(email.recipients)
										? email.recipients.map((r) => r.address).join(', ')
										: 'N/A'} <br />
								{:else}
									<strong>From:</strong>
									{email.fromAddress || 'N/A'} <br />
								{/if}
								<strong>Subject:</strong>
								{email.subject || '(no subject)'}
								<p>{email.bodyText?.substring(0, 100) || ''}...</p>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</main>
</div>

<style>
	.inbox-layout {
		display: grid;
		grid-template-columns: 240px 1fr;
		height: calc(100vh - 60px);
	}

	aside {
		border-right: 1px solid #eee;
		overflow-y: auto;
	}

	.inbox-container {
		padding: 1rem;
		overflow-y: auto;
	}

	.error {
		color: red;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		padding: 1rem;
		border-bottom: 1px solid #eee;
		cursor: pointer;
	}

	li.unread {
		font-weight: bold;
		background-color: #f8f9fa;
	}

	li.read {
		border-left: 6px solid #2196f3;
		background-color: #e3f2fd;
	}

	.read-indicator {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin-right: 8px;
		background: #2196f3;
		opacity: 0.7;
		vertical-align: middle;
	}

	li.unread .read-indicator {
		background: #bdbdbd;
		opacity: 0.5;
	}

	.email-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	li:hover {
		background-color: #f0f0f0;
	}

	.email-link {
		text-decoration: none;
		color: inherit;
	}
</style>
