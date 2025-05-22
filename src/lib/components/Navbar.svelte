<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let isScrolled = $state(false);

	onMount(() => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 0;
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<header class:is-scrolled={isScrolled}>
	<h1 class="title">Ripple Mail</h1>
	<nav class="navbar">
		<ul>
			<li>
				<a href="/" class:active={page.url.pathname === '/'}> Testing Button </a>
			</li>
			<li>
				<a href="/color-test" class:active={page.url.pathname === '/color-test'}> Color Test </a>
			</li>
			<li>
				<a href="/404" class:active={page.url.pathname === '/404'}> 404 page </a>
			</li>
		</ul>
	</nav>
</header>

<style>
	header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		width: 100%;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--surface-alt-color);
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		transition:
			box-shadow 0.3s ease,
			backdrop-filter 0.8s ease;
	}

	header.is-scrolled {
		background-color: var(--nav-blur-surface-color);
		backdrop-filter: blur(10px);
	}

	.title {
		position: absolute;
		left: 1rem;
		font-size: 1.5rem;
		font-weight: bold;
		white-space: nowrap;
		margin: 0;
	}

	.navbar {
		display: flex;
		justify-content: center;
		text-align: center;
		align-items: center;
		width: 100%;
	}

	.navbar ul {
		display: flex;
		gap: 1rem;
		list-style: none;
		align-items: center;
		justify-content: center;
		align-items: center;
		padding: 0;
		margin: 0;
	}

	.navbar a {
		color: var(--text-secondary-color);
		text-decoration: none;
		font-weight: 600;
		text-align: center;
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		border: 1px solid transparent;
		transition:
			color 0.2s ease,
			background-color 0.2s ease,
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		white-space: nowrap;
	}

	.navbar a:hover {
		color: var(--text-primary-color);
		background-color: var(--surface-hover-color);
		border-color: var(--primary-color);
		box-shadow: 0 0 12px var(--primary-color);
		transition: all 0.2s ease;
	}

	.navbar a.active {
		color: var(--text-primary-color);
		background-color: var(--surface-hover-color);
	}
</style>
