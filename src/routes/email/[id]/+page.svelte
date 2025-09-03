<script lang="ts">
	let { data } = $props();
</script>

<div class="email-view">
	{#if data.error}
		<p class="error">{data.error}</p>
	{:else if data.email}
		<div class="email-header">
			<h2>{data.email.email.subject || '(no subject)'}</h2>
			<p><strong>From:</strong> {data.email.email.fromAddress}</p>
			<p>
				<strong>To:</strong>
				{data.email.email.recipients?.filter((r) => r.type === 'to').map((r) => r.address).join(', ')}
			</p>
			{#if data.email.email.recipients?.some((r) => r.type === 'cc')}
				<p>
					<strong>Cc:</strong>
					{data.email.email.recipients?.filter((r) => r.type === 'cc').map((r) => r.address).join(', ')}
				</p>
			{/if}
			<p><strong>Date:</strong> {new Date(data.email.email.createdAt).toLocaleString()}</p>
		</div>
		<div class="email-body">
			<pre>{data.email.email.bodyText}</pre>
		</div>
	{:else}
		<p>Loading email...</p>
	{/if}
</div>

<style>
	.email-view {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}
	.email-header {
		border-bottom: 1px solid #ccc;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}
	.email-header h2 {
		margin-top: 0;
	}
	.email-header p {
		margin: 0.25rem 0;
		color: #555;
	}
	.email-body {
		white-space: pre-wrap;
		word-wrap: break-word;
		line-height: 1.6;
	}
	.error {
		color: red;
	}
</style>