<script lang="ts">
    import { isLoggedInStore } from '$lib/stores';
    import { page } from '$app/state';
    let { children } = $props();
    import Notification from '$lib/components/Notification.svelte';

    if (!$isLoggedInStore) {
        window.location.href = '/login';
    }

    function disabledClick(e: Event) {
        e.preventDefault();
        window.createNotification?.('Disabled', 'This action is disabled', '#f93943');
    }
</script>

<div class="another-container">
    <aside class="sidebar">
        <a href="/" aria-label="idk" class="logo-link"><h1 class="logo">Ripple</h1></a>
        <nav>
            <a href="/inbox" class="nav-item {page.route.id === '/(loggedIn)/inbox' ? 'active' : ''}">Inbox</a>
            <a href="/" class="nav-item disabled" onclick={disabledClick}>Sent</a>
            <a href="/" class="nav-item disabled" onclick={disabledClick}>Drafts</a>
            <a href="/" class="nav-item disabled" onclick={disabledClick}>Trash</a>
        </nav>
    </aside>

    <main class="main-container">
        {@render children()}
    </main>

    <Notification />
</div>

<style>
    :global(body) {
        margin: 0;
        font-family: system-ui, sans-serif;
        color: var(--text-primary-color);
    }

    .another-container {
        display: flex;
        height: 100vh;
    }

    .sidebar {
		width: 220px;
		background-color: var(--sidebar-color);
		padding: 1rem;
		display: flex;
		flex-direction: column;
	}

    .logo-link {
        text-decoration: none;
    }

    .logo-link:hover {
        text-decoration: none;
    }

	.logo {
		color: #fff;
		font-size: 1.2rem;
		margin-bottom: 2rem;
        user-select: none;
	}

	.nav-item {
		display: block;
		padding: 0.5rem 0;
		text-indent: 10px;
		color: var(--text-secondary-color);
        text-decoration: none;
		border-radius: 10px;
        user-select: none;
	}

	.nav-item:hover, .nav-item.active {
        color: var(--text-primary-color);
        background-color: var(--sidebar-nav-color);
		text-decoration: none;
	}

    .nav-item.disabled {
        cursor: not-allowed;
    }

    .main-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		background-color: #181818;
        overflow-y: auto;
        height: 100vh;
	}

    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }

    @keyframes fadeout {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(20px); }
    }
</style>