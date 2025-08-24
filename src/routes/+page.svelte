<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Your Inbox</h1>

{#if data.emails && data.emails.length > 0}
	<ul>
		{#each data.emails as email (email.id)}
			<li>
				<strong>From:</strong>
				{email.from_address || 'N/A'} <br />
				<strong>Subject:</strong>
				{email.subject || '(no subject)'}
			</li>
		{/each}
	</ul>
{:else}
	<p>Your inbox is empty.</p>
{/if}

<style>
	li {
		list-style-type: none;
		padding: 0.5rem;
		border-bottom: 1px solid #eee;
	}
</style>
