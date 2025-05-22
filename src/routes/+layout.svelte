<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { children } = $props();
</script>

<div class="site-container">
	<Navbar />
	<main class="container">
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	.site-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	main {
		flex: 1;
		margin-top: 80px !important;
	}
	.container {
		font-family: Barlow, serif;
		width: 100%;
		max-width: 1600px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}
</style>
