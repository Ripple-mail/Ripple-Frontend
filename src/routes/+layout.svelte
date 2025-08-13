<script lang="ts">
    import '../app.css';
    import { settingsStore } from '$lib/stores';
	import { onMount } from 'svelte';
    
    let { children } = $props();

    onMount(() => {
        document.documentElement.className = $settingsStore.theme;
    });
</script>

<div class="site-container">
    <main class="container">
        {@render children()}
    </main>
</div>

<style>
    .site-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    /* Scrollbar -- FireFox */
    :global(html) {
        scrollbar-width: thin;
        scrollbar-color: var(--scrollbar-color) transparent;
    }

    /* Scrollbar webkit -- Chromium browsers and Safari (webkit based) */
    :global(::-webkit-scrollbar) {
        width: 10px;
    }

    :global(::-webkit-scrollbar-track) {
        background: transparent;
    }

    :global(::-webkit-scrollbar-thumb) {
        background-color: transparent;
        border-radius: 5px;
        border: 2px solid var(--scrollbar-color);
    }

/*    main {
        flex: 1;
        margin-top: 80px !important;
    }

    .container {
        font-family: Barlow, serif;
        width: 100%;
        max-width: 1600px;
        margin: 0 auto;
        padding: 0 1.5rem;
    } */
</style>