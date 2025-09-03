<script lang="ts">
	import { api } from '$lib/api';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let to = $state('');
	let subject = $state('');
	let body = $state('');
	let error = $state('');
	let success = $state('');
	let isSending = $state(false);

	async function sendEmail(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		success = '';

		const emailRegex = /^[a-zA-Z0-9_.-]+~[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(to)) {
			error = 'Invalid email format. Please use the format user~domain.com';
			return;
		}

		isSending = true;

		const currentUser = $auth.user;
		if (!currentUser) {
			error = 'You must be logged in to send an email.';
			isSending = false;
			return;
		}

		try {
			await api.post('/emails/send', {
				from: { id: currentUser.id, email: currentUser.email },
				recipients: [{ email: to, type: 'to' }],
				subject,
				body
			});
			success = 'Email sent successfully!';
			setTimeout(() => goto('/inbox'), 2000);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to send email.';
		} finally {
			isSending = false;
		}
	}
</script>

<div class="compose-container">
	<h1>Compose Email</h1>

	<form onsubmit={sendEmail}>
		<label>
			To:
			<input type="text" bind:value={to} required />
		</label>
		<label>
			Subject:
			<input type="text" bind:value={subject} />
		</label>
		<label>
			Body:
			<textarea bind:value={body} rows="10" required></textarea>
		</label>
		<button type="submit" disabled={isSending}>
			{isSending ? 'Sending...' : 'Send'}
		</button>
	</form>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	{#if success}
		<p class="success">{success}</p>
	{/if}
</div>

<style>
	.compose-container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		border: 1px solid #ccc;
		border-radius: 8px;
	}
	.error {
		color: red;
	}
	.success {
		color: green;
	}
	textarea {
		width: 100%;
	}
</style>
