<script lang="ts">
    import { userStore } from '$lib/stores';
    import { onMount } from 'svelte';
    import type { Email, FormattedEmail } from '$lib/types.js';
    import { convertTimeToLocale, convertTimeToRelative, getInitials } from '$lib/utils';
    import mime from 'mime';
	import { API_URL } from '$lib/config.js';

    let { data } = $props();

    let rawEmail: Email = {
        filename: '',
        path: '',
        content: '',
        unread: false,
        attachments: []
    }

    let notFound: boolean = $state(false);
    let email: FormattedEmail | null = $state(null);

    onMount(async () => {
        const res = await fetch(`${API_URL}/users/${$userStore.id}/mail/${data.timestamp}`);
        if (!res.ok) {
            notFound = true;
            return;
        }
        const emailjson = await res.json();
        rawEmail = emailjson.email;

        console.log(rawEmail);

        email = {
            timestampRelative: convertTimeToRelative(rawEmail.filename.split('.')[0]),
            timestampLocale: convertTimeToLocale(rawEmail.filename.split('.')[0]),
            from: rawEmail.content.split('\n')[0].split(' ')[1],
            rcpt: rawEmail.content.split('\n')[1].split(' ')[1],
            subject: rawEmail.content.split('\n')[2].split(' ').slice(1).join(' '),
            content: rawEmail.content.split('\n').slice(3).join('\n'),
            attachments: rawEmail.attachments
        }
    });
</script>

<svelte:head>
    <title>{email?.subject} - {$userStore.email}</title>
</svelte:head>

<header class="topbar">
    <div class="back" onclick={() => history.back()} role="none">{'<'}</div>
    <div class="profile" onclick={() => window.location.href = '/settings'} role="none">{getInitials($userStore.name)}</div>
</header>
{#if notFound}
    <div class="email-page error">
        <h2>Email not found</h2>
        <p>The email with the given timestamp doesn't exist for this user.</p>
    </div>
{:else if email}
    <div class="email-page">
        <header class="email-header">
            <h1>{email.subject}</h1>
            <small class="email-timestamp" title={email.timestampLocale}>{email.timestampRelative}</small>
        </header>

        <section class="email-meta">
            <div><strong>From:</strong> {email.from}</div>
        </section>

        <hr />

        <section class="email-body">
            <p>{email.content}</p>
        </section>

        {#if email.attachments[0]}
            <br />
            <hr />

            <section class="email-attachments">
                <h3>Attachments</h3>
                {#each email.attachments as attachment}
                    {@const attachmentUrl = `http://localhost:3001${attachment}`}
                    <div class="attachment-preview">
                        {#if mime.getType(attachment)?.startsWith('video/')}
                            <video src={attachmentUrl} controls>
                                <track kind="captions">
                            </video>
                        {:else if mime.getType(attachment)?.startsWith('image/')}
                            <img src={attachmentUrl} alt={attachment} />
                        {:else if mime.getType(attachment)?.startsWith('audio/')}
                            <audio src={attachmentUrl} controls></audio>
                        {/if}
                    </div>
                {/each}
            </section>
        {/if}
    </div>
{:else}
    <div class="email-page loading">
        <p>Loading email...</p>
    </div>
{/if}

<style>
    .topbar {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		background-color: var(--topbar-color);
        border-bottom: 2px solid var(--border-primary-color);
        justify-content: space-between;
	}

    .back {
        cursor: pointer;
        user-select: none;
    }

    .profile {
		margin-left: 1rem;
		background-color: #444;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #eee;
		font-weight: bold;
		font-size: 0.9rem;
		cursor: pointer;
	}

    .email-page {
        padding: 2rem;
        background-color: #121212;
        color: #eee;
        font-family: system-ui, sans-serif;
        min-height: 100vh;
    }

    .email-header h1 {
        margin: 0;
        font-size: 1.75rem;
        color: #fff;
    }

    .email-timestamp {
        color: #888;
        font-size: 0.9rem;
        cursor: help;
    }

    .email-meta {
        margin-top: 1rem;
        color: #aaa;
        font-size: 1rem;
    }

    .email-body {
        margin-top: 2rem;
        line-height: 1.6;
        color: #ddd;
    }

    .error {
        color: #f77;
        text-align: center;
        margin-top: 3rem;
    }

    .loading {
        color: #777;
        text-align: center;
        margin-top: 3rem;
    }

    .attachment-preview {
        display: inline-block;
        margin: 0.5rem;
        max-width: 300px;
        max-height: 300px;
        overflow: hidden;
        border-radius: 8px;
        background: var(--border-primary-color);
        padding: 0.25rem;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .attachment-preview img,
    .attachment-preview video {
        width: 100%;
        height: auto;
        border-radius: 4px;
    }
</style>