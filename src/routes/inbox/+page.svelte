<script lang="ts">
	import { api } from '$lib/api';
	import type { Email } from '$lib/types';
	import { notice } from '$lib/stores/notice';
	import { goto } from '$app/navigation';
    import Mailboxes from '$lib/components/Mailboxes.svelte';

	let { data }: { data: { mailboxId: number | null } } = $props();

	let emails: Email[] = $state([]);
	let isLoading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let timeout: number;

	async function fetchEmails(mailboxId: number | null) {
		isLoading = true;
		error = '';
		try {
			const url = mailboxId ? `/emails?mailboxId=${mailboxId}` : '/emails';
			const response = (await api.get(url)) as { data: any[] };

			emails = response.data.map((item) => ({
                ...item.emails,
                ...item.user_emails,
                recipients: item.recipients
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
			const response = (await api.get(url)) as { data: any[] };
			emails = response.data.map((item) => {
                return { ...item.user_emails, ...item.emails };
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
    })

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
                {#each emails as email (email.id)}
                    <li>
                        {#if email.isSender}
                            <strong>To:</strong>
                            {email.recipients?.join(', ') || 'N/A'} <br />
                        {:else}
                            <strong>From:</strong>
                            {email.fromAddress || 'N/A'} <br />
                        {/if}

                        <strong>Subject:</strong>
                        {email.subject || '(no subject)'}
                        <p>{email.body_text?.substring(0, 100) || ''}...</p>
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
        height: calc(100vh - 60px); /* Adjust based on header height */
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
    li:hover {
        background-color: #f9f9f9;
    }
</style>
