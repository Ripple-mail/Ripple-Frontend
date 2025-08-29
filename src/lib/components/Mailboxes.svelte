<script lang="ts">
	import { api } from '$lib/api';
	import type { Mailbox } from '$lib/types';
	import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

	let mailboxes: Mailbox[] = $state([]);
	let newMailboxName = $state('');
	let error = $state('');
    let editingMailboxId: number | null = $state(null);
    let editingMailboxName = $state('');

	async function fetchMailboxes() {
		try {
			const response = (await api.get('/mailboxes')) as { data: Mailbox[] };
			mailboxes = response.data;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to fetch mailboxes.';
		}
	}

	async function createMailbox(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		try {
			const response = (await api.post('/mailboxes', { name: newMailboxName })) as {
				data: Mailbox;
			};
			mailboxes = [...mailboxes, response.data];
			newMailboxName = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create mailbox.';
		}
	}

    async function handleUpdateMailbox(mailboxId: number) {
        if (!editingMailboxName.trim()) return;
        try {
            await api.put(`/mailboxes/${mailboxId}`, { name: editingMailboxName });
            mailboxes = mailboxes.map(m => m.id === mailboxId ? { ...m, name: editingMailboxName } : m);
            editingMailboxId = null;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to update mailbox.';
        }
    }

    async function deleteMailbox(mailboxId: number) {
        if (!confirm('Are you sure you want to delete this mailbox? This action cannot be undone.')) {
            return;
        }
        try {
            await api.delete(`/mailboxes/${mailboxId}`);
            mailboxes = mailboxes.filter(m => m.id !== mailboxId);
            // If the currently viewed mailbox is deleted, navigate to the general inbox
            if ($page.url.searchParams.get('mailboxId') === String(mailboxId)) {
                await goto('/inbox');
            }
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to delete mailbox.';
        }
    }

    function startEditing(mailbox: Mailbox) {
        editingMailboxId = mailbox.id;
        editingMailboxName = mailbox.name;
    }

	onMount(fetchMailboxes);
</script>

<div class="mailbox-list-container">
	<h4>Mailboxes</h4>
	<ul>
		{#each mailboxes as mailbox (mailbox.id)}
			<li>
                {#if editingMailboxId === mailbox.id}
                    <input type="text" bind:value={editingMailboxName} onkeydown={(e) => e.key === 'Enter' && handleUpdateMailbox(mailbox.id)} />
                    <button onclick={() => handleUpdateMailbox(mailbox.id)}>Save</button>
                    <button onclick={() => editingMailboxId = null}>Cancel</button>
                {:else}
				    <a href={`/inbox?mailboxId=${mailbox.id}`} class:active={$page.url.searchParams.get('mailboxId') == String(mailbox.id)}>{mailbox.name}</a>
                    {#if !mailbox.systemMailbox}
                        <div class="actions">
                            <button class="edit" onclick={() => startEditing(mailbox)}>✏️</button>
                            <button class="delete" onclick={() => deleteMailbox(mailbox.id)}>🗑️</button>
                        </div>
                    {/if}
                {/if}
			</li>
		{/each}
	</ul>

	<form onsubmit={createMailbox} class="create-form">
		<input type="text" bind:value={newMailboxName} placeholder="New mailbox..." required />
		<button type="submit">+</button>
	</form>
	{#if error}<p class="error">{error}</p>{/if}
</div>

<style>
	.mailbox-list-container {
		padding: 10px;
	}
    ul {
        list-style: none;
        padding: 0;
    }
    li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        border-radius: 4px;
    }
    li:hover {
        background-color: #f0f0f0;
    }
    a {
        text-decoration: none;
        color: #333;
        flex-grow: 1;
    }
    a.active {
        font-weight: bold;
    }
    .actions button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px 5px;
        visibility: hidden; /* Hide by default */
    }
    li:hover .actions button {
        visibility: visible; /* Show on hover */
    }
    .create-form {
        display: flex;
        margin-top: 10px;
    }
    .create-form input {
        flex-grow: 1;
    }
	.error {
		color: red;
        font-size: 0.8em;
	}
</style>
