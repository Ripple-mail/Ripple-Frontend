<script lang="ts">
    import { userStore } from '$lib/stores';
    import { getInitials } from '$lib/utils';
</script>

<header class="topbar">
    <a href="inbox">Inbox</a>
    {#if $userStore}
        <div class="profile" onclick={() => window.location.href = '/settings'} role="none">{getInitials($userStore.name)}</div>
    {:else}
        <a href="login">Login</a>
    {/if}
</header>

<div class="banner">
    Ripple is moving domains soon! The new domain will be
    <a href="https://ripplemail.de" target="_blank">ripplemail.de</a>
</div>

<div class="homepage-container">
    <h1>Ripple</h1>

    <p style="margin-top: -25px;">
        Welcome to Ripple!
    </p>

    <p style="margin-top: -5px;">
        Ripple is an email service created by <a href="https://github.com/ultraslayyy" target="_blank" style="color: var(--text-primary-color);">Ultraslayyy</a>.<br>
        It incorporates a non-secure localStorage based session system, along with OTP (One Time Password) and WebAuthn (Passkey) systems for 2FA (Two-Factor Authentication).<br>
        The below is a sample of what the inbox page looks like (None of the buttons work on purpose).<br>
        We hope you pick us for your next emailing adventure.
    </p>

    <iframe src="sample.html" title="Sample Inbox" height=720 width=1280></iframe>

    <h2>Informative Video</h2>
    <p style="margin-top: -25px;">Below is an informative uncut video on how I made this work and how it does. (This is mainly a joke and is 2 hours long. I don't actually expect you to watch this).</p>
    <iframe src="https://www.youtube.com/embed/d8rg6-VtYD8" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<style>
    .topbar {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        background-color: var(--topbar-color);
        border-bottom: 2px solid var(--border-primary-color);
        justify-content: space-between;
    }

    .topbar a {
        text-decoration: none;
        color: var(--text-secondary-color);
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

    .banner {
        background-color: #ffff4f;
        color: black;
        text-align: center;
        padding: 0.5rem;
        font-weight: bold;
    }

    .homepage-container {
        width: 100vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        min-height: calc(100vh - 64px);
        padding-bottom: 18px;
    }

    p {
        text-align: center;
    }

    iframe {
        max-width: 90%;
        max-height: 80vh;
        width: 1280px;
        height: 720px;
        border: none;
    }
</style>