<script lang="ts">
	import { userStore, paneWidthStore, settingsStore } from '$lib/stores';
	import type { Email } from '$lib/types';
	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';
	import { convertTimeToRelative, convertTimeToLocale, getInitials } from '$lib/utils';
	import CreateEmail from '$lib/components/modals/CreateEmail.svelte';
    import mime from 'mime';
    import Notif from '$lib/components/Notification.svelte';
    import { API_URL, BACKEND_URL } from '$lib/config';

	let showModal = $state(false);

    let currentHash = $state('');

	let emails: Email[] = $state([]);
	let selectedEmail: Email | null = $state(null);

	// Dragging
	let paneWidth = $state(parseInt($paneWidthStore));
	let isDragging = false;
	let dragOffset = 0;
	const defaultPaneWidth = 797.5;

	function handleMouseDown(event: MouseEvent) {
		isDragging = true;
		dragOffset = event.clientX - paneWidth;
	}

	function handleDoubleClick() {
		paneWidth = defaultPaneWidth;
		paneWidthStore.set(paneWidth);
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;
		const minWidth = 270;
		const maxWidth = window.innerWidth - 320;

		let newWidth = event.clientX - dragOffset;
		newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

		paneWidth = newWidth;
		paneWidthStore.set(paneWidth);
	}

	// Mouse events
	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		}
	});

	// Everything else
	onMount(async () => {
        // Fetching initial emails
		const res = await fetch(`${API_URL}/users/${$userStore.id}/mail`);
		const data = await res.json(); //@ts-ignore
		emails = data.emails.sort((a, b) => parseInt(b.filename.split('.')[0], 10) - parseInt(a.filename.split('.')[0], 10));
		
        // Notifying user
		if ($settingsStore.notifications) {
			requestNotificationPermission();
		}

        // Websocket
		const socket = io(BACKEND_URL, {
			path: '/ws',
			transports: ['websocket']
		});

		socket.on('connect', () => {
			console.log('[Websocket] Connected as:', socket.id);

			socket.emit('joinRoom', { room: `user_${$userStore.id}` });
		});

		socket.on('newEmail', async (email) => {
			const res = await fetch(`${API_URL}/users/${$userStore.id}/mail`);
			const data = await res.json(); //@ts-ignore
			emails = data.emails.sort((a, b) => parseInt(b.filename.split('.')[0], 10) - parseInt(a.filename.split('.')[0], 10));

			maybeNotify(emails[0]);
		});		

		socket.on('readEmail', async () => {
			const index = emails.findIndex(email => email.filename === email.filename);
			if (index === -1) return; // Should NEVER be called. For safety
			emails[index].unread = false;
		});
	});

    // Url hash
    onMount(() => {
        currentHash = window.location.hash;
        const updateHash = () => {
            currentHash = window.location.hash;
        }
        window.addEventListener('hashchange', updateHash);

        return () => {
            window.removeEventListener('hashchange', updateHash);
        }
    });

	function openInNewTab() {
		if (!selectedEmail) return;
		const blob = new Blob([`
			<!DOCTYPE html>
			<html lang="en">
			<head><title>${selectedEmail.content.split('\n')[2]}</title></head>
			<body style="background: #121212; color: white; font-family: sans-serif; padding: 2rem;>"
				<h2>${selectedEmail.content.split('\n')[2]}</h2>
				<h4>From: ${selectedEmail.content.split('\n')[0]}</h4>
				<p>${selectedEmail.content}</p>
			</body>
			</html>
		`], { type: 'text/html' });

		const url = URL.createObjectURL(blob);
		window.open(url, '_blank');
	}

	// Notifications
	function requestNotificationPermission() {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}
	}

	function notifyNewEmail(email: Email) {
		if ('Notification' in window && Notification.permission === 'granted') {
			const notification = new Notification(`New email from ${email.content.split('\n')[0].split(' ')[1]}`, {
				body: email.content.split('\n')[2].split(' ').slice(1).join(' ')
			});

			notification.onclick = () => window.focus();
		}
	}

	function maybeNotify(email: Email) {
		if ($settingsStore.notifications && Notification.permission === 'granted') {
            if (!document.hasFocus() || document.hidden) {
			    notifyNewEmail(email);
            }
		}
	}

    async function loadEmails() {
        const res = await fetch(`${API_URL}/users/${$userStore.id}/mail${currentHash ? '/sent' : ''}`);
        const data = await res.json(); //@ts-ignore
        emails = data.emails.sort((a, b) => parseInt(b.filename.split('.')[0], 10) - parseInt(a.filename.split('.')[0], 10));
    }
</script>

<svelte:head>
    <title>Inbox ({emails.filter(email => email.unread).length}) - {$userStore.email}</title>
</svelte:head>

<div class="inbox-container">
	<!-- Main -->
	<main class="main">
		<!-- Navbar -->
		<header class="topbar">
			<input class="search" type="text" placeholder="Search mail..." onclick={() => window.createNotification?.('Disabled', 'Searching is currently disabled', '#f93943')} readonly />
            <button class="email-popup-button" type="button" onclick={() => showModal = true}>Send Email</button>
			<div class="profile" onclick={() => window.location.href = '/settings'} role="none">{getInitials($userStore.name)}</div>
		</header>

		<section class="main-content">
			<div class="email-list" style="width: {paneWidth}px">
				{#each emails as email}
					<div class="email-item {email.unread ? 'unread' : ''}" onclick={async () => {
                        selectedEmail = email;
                        if (selectedEmail.unread) {
                            const res = await fetch(`${API_URL}/users/${$userStore.id}/read/${selectedEmail.filename.split('.')[0]}`);
                        }
                    } } role="none">
						<div class="email-sender">{email.content.split('\n')[0]}</div>
						<div class="email-content">
							<div class="email-subject"><a class="email-subject-link" href={`/inbox/${email.filename.split('.')[0]}`}>{email.content.split('\n')[2]}</a></div>
							<div class="email-snippet">{email.content.split('\n')[3]}</div>
						</div>
						<div class="email-time" title={convertTimeToLocale(email.filename.split('.')[0])}>{convertTimeToRelative(email.filename.split('.')[0])}</div>
					</div>
				{/each}
			</div>

			<!-- Drag handle -->
			<div class="drag-handle" onmousedown={handleMouseDown} ondblclick={handleDoubleClick} role="none"></div>

			<!-- Reading pane -->
			{#if selectedEmail}
				<div class="reading-pane">
					<div class="pane-header">
						<h2>{selectedEmail.content.split('\n')[2]}</h2>
						<!-- <button onclick={() => openInNewTab}>Open Blob in New Tab</button> -->
						<a class="open-tab" href={`/inbox/${selectedEmail.filename.split('.')[0]}`} target="_blank">Open in new tab</a>
					</div>
					<h4>{selectedEmail.content.split('\n')[0]}</h4>
					<p>{selectedEmail.content.split('\n').slice(3).join('\n')}</p>
                    {#if selectedEmail.attachments[0]}
                        <hr />
                        <h3>Attachments</h3>
                        {#each selectedEmail.attachments as attachment}
                            {@const attachmentUrl = `${BACKEND_URL}${attachment}`}
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
                    {/if}
				</div>
			{:else}
				<div class="reading-pane placeholder">
					<p>Select an email to read</p>
				</div>
			{/if}
		</section>

        <!-- Send email modal -->
		{#if showModal}
			<div class="create-email-popup">
				<CreateEmail bind:showModal />
			</div>
		{/if}
	</main>

    <Notif />
</div>

<style>
	.inbox-container {
		display: flex;
		height: 100vh;
	}

	.main {
		flex: 1;
		display: flex;
		flex-direction: column;
		background-color: #181818;
	}

	.main-content {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.topbar {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		background-color: var(--topbar-color);
        border-bottom: 2px solid var(--border-primary-color);
	}

	.search {
		flex: 1;
		padding: 0.5rem;
		border-radius: 4px;
		border: none;
		background-color: var(--sidebar-nav-color);
		color: #eee;
        cursor: not-allowed;
	}

	.search::placeholder {
		color: #999;
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

	.email-list {
		overflow-y: auto;
		border-right: 1px solid var(--topbar-color);
		min-width: 240px;
		background-color: #181818;
	}

	.email-item {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--topbar-color);
		cursor: pointer;
		transition: background 0.2s;
	}

	.email-item:hover {
		background-color: #242424;
	}

	.email-item.unread {
		background-color: #202020;
		font-weight: bold;
	}

	.email-sender {
		width: 150px;
		flex-shrink: 0;
        max-width: 18ch;
        overflow: clip;
        text-overflow: ellipsis;
	}

	.email-content {
		flex: 1;
		overflow: hidden;
	}

	.email-subject {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.email-snippet {
		font-size: 0.85rem;
		color: #999;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.email-time {
		margin-left: 1rem;
		color: #777;
		font-size: 0.8rem;
		cursor: help;
	}

	a {
        color: inherit;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

	.drag-handle {
		width: 5px;
		cursor: col-resize;
		background-color: var(--border-primary-color);
	}

	.drag-handle:hover {
		background-color: var(--border-secondary-color);
        user-select: none;
	}

	.reading-pane {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
		background-color: #1c1c1c;
		min-width: 320px;
	}

	.reading-pane h2 {
		margin: 0;
		font-size: 1.5rem;
	}

	.reading-pane h4 {
		color: #999;
		font-weight: normal;
		margin-top: 0.5rem;
	}

	.reading-pane p {
		margin-top: 1rem;
		line-height: 1.6;
		color: #ddd;
	}

	.reading-pane.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666;
		font-size: 1.1rem;
	}

	.pane-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	/* .pane-header button {
		background: #333;
		color: white;
		border: none;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.pane-header button:hover {
		background: #444;
	} */

	.open-tab {
		background: #333;
		color: white;
		border: none;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		cursor: pointer;
	}
	
	.open-tab:hover {
		background: #444;
	}

	.create-email-popup {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 9990;
	}

    .email-popup-button {
        margin-left: 1rem;
        cursor: pointer;
        color: var(--text-primary-color);
        border: 2px solid var(--border-secondary-color);
        background-color: var(--alt-surface-color);
        padding-top: 7px;
        padding-bottom: 7px;
        padding-left: 15px;
        padding-right: 15px;
        border-radius: 12px;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .email-popup-button:hover {
        background-color: #272727;
    }

    .attachment-preview {
        display: inline-block;
        margin: 0.5rem;
        max-width: 150px;
        max-height: 150px;
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