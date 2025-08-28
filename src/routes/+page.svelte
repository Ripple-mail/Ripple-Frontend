<script lang="ts">
	import { auth } from '$lib/stores/auth';
</script>

<div class="frontpage">
    {#if $auth.user}
		<h1>Hello, {$auth.user.username}!</h1>
	{/if}
	<h2>Welcome to Ripple</h2>
    <p>Use the navigation options above to log in, register or expolore your inbox if you are already logged in.</p>

	
</div>

<style>
	.frontpage {
		text-align: center;
		padding: 3rem 1rem;
		max-width: 600px;
		margin: 0 auto;
	}
	p {
		color: #555;
		font-size: 1.1rem;
	}
</style>