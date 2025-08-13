<script lang="ts">
    import { settingsStore, isLoggedInStore, userStore } from '$lib/stores';
    import Notification from '$lib/components/Notification.svelte';
    import { getInitials } from '$lib/utils';
	import { API_URL } from '$lib/config';

    let qrCode = '';
    let totpSetupSecret = '';
    let totpTokenConfirm = '';
    let totpEnabled = $userStore.twofaTotpEnabled ?? false;

    function bufferToBase64url(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach((b) => binary += String.fromCharCode(b));
        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    async function setupTotp() {
        const res = await fetch(`${API_URL}/auth/totp/setup`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: $userStore.id })
        });

        const data = await res.json();
        qrCode = data.qr;
        totpSetupSecret = data.secret;
    }

    async function confirmTotp() {
        const res = await fetch(`${API_URL}/auth/totp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token: totpTokenConfirm, userId: $userStore.id })
        });

        const data = await res.json();

        console.log(data);

        if (data.status === 'success') {
            totpEnabled = true;
            qrCode = '';
        } else {
            window.createNotification?.('Setting up TOTP failed', 'Setting up TOTP auth failed. Try again or contact support', '#f93943');
        }
    }

    async function disableTotp() {
        const res = await fetch(`${API_URL}/auth/totp/disable`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: $userStore.id })
        });

        const data = await res.json();

        if (data.status === 'success') {
            totpEnabled = false;
        } else {
            window.createNotification?.('Error disabling TOTP', 'Setting up TOTP auth failed. Try again or contact support', '#f93943')
        }
    }

    async function startPasskeyRegistration() {
        const res = await fetch(`${API_URL}/auth/webauthn/generate-registration-options`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: $userStore.id })
        });

        const options = await res.json();

        options.challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        options.user.id = Uint8Array.from(atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        if (options.excludeCredentials) { // @ts-ignore
            options.excludeCredentials = options.excludeCredentials.map((cred) => ({
                ...cred,
                id: Uint8Array.from(atob(cred.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
            }));
        }

        const cred = await navigator.credentials.create({ publicKey: options });

        if (!cred || cred?.type !== 'public-key') {
            throw new Error('Invalid credential');
        }

        const credential = cred as PublicKeyCredential;
        const attestationCred = credential.response as AuthenticatorAttestationResponse; 

        const attestationResponse = {
            id: credential.id,
            rawId: bufferToBase64url(credential.rawId),
            response: {
                attestationObject: bufferToBase64url(attestationCred.attestationObject),
                clientDataJSON: bufferToBase64url(attestationCred.clientDataJSON),

                // Not required
                authenticatorData: attestationCred.getAuthenticatorData(),
                transports: attestationCred.getTransports() ?? [],
                publicKeyAlgorithm: attestationCred.getPublicKeyAlgorithm(),
                publicKey: attestationCred.getPublicKey()
            },
            clientExtensionResults: credential.getClientExtensionResults() ?? {},
            type: credential.type
        }

        const verifyRes = await fetch(`${API_URL}/auth/webauthn/verify-registration`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: $userStore.id, credential: attestationResponse })
        });

        const verifyData = await verifyRes.json();
        if (verifyData.verified) {
            userStore.set({ ...$userStore, twofaPasskeyEnabled: true });
        } else {
            window.createNotification?.('Passkey failed', 'Could not verify passkey. Try again.', '#f93943');
            console.log(verifyData);
        }
    }

    settingsStore.subscribe(settings => {
        const theme = settings.theme;
        document.documentElement.className = theme;
    });

    function logout() {
        isLoggedInStore.set(false);
        userStore.set(null);
        window.location.href = '/login';
    }
</script>

<svelte:head>
    <title>Settings - {$userStore.email}</title>
</svelte:head>

<header class="topbar">
    <div><strong>Settings</strong></div>
    <div class="profile">{getInitials($userStore.name)}</div>
</header>

<div class="settings-page">
    <h1>Settings</h1>

    <div class="settings-section">
        <h2>Preferences</h2>
        <label>
            <input type="checkbox" bind:checked={$settingsStore.notifications} />
            Enable Notifications
        </label>
    </div>

    <div class="settings-section">
        <h2>Appearance</h2>

        <label>
            Theme:
            <select bind:value={$settingsStore.theme}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System Default</option>
            </select>
        </label>
    </div>

    <div class="settings-section">
        <h2>User Actions</h2>
        
        <button onclick={logout}>Logout</button>
    </div>

    <div class="settings-section">
        <h2>Two-Factor Authentication (OTP)</h2>

        {#if !totpEnabled}
            <button onclick={setupTotp}>Enable 2FA</button>

            {#if qrCode}
                <p>Scan this QR code with your authenticator app:</p>
                <img src={qrCode} alt="TOTP QR Code" />
                {#if totpSetupSecret}
                    <p>Or enter this code manually:</p>
                    <code>{totpSetupSecret}</code>
                {/if}
                <input type="text" placeholder="Enter code from app" bind:value={totpTokenConfirm} />
                <button onclick={confirmTotp}>Confirm 2FA</button>
            {/if}
        {:else}
            <p>2FA is enabled.</p>
            <button onclick={disableTotp}>Disable 2FA</button>
        {/if}
    </div>

    <div class="settings-section">
        <h2>Two-Factor Authentication (Passkey)</h2>

        {#if !$userStore.twofaPasskeyEnabled}
            <button onclick={startPasskeyRegistration}>Enable Passkey</button>
        {:else}
            <p>Passkey login is enabled for your account.</p>
        {/if}
    </div>

    <Notification />
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
	}

	.settings-page {
        margin-top: -2rem;
		padding: 2rem;
		color: #eee;
		min-height: 100vh;
		font-family: system-ui, sans-serif;
	}

	h1 {
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
	}

	.settings-section {
		margin-bottom: 2rem;
		background-color: #1a1a1a;
		padding: 1rem 1.5rem;
		border-radius: 8px;
        border: 3px solid var(--border-secondary-color);
	}

	.settings-section h2 {
		margin-top: 0;
		color: #ccc;
		font-size: 1.2rem;
	}

	label {
		display: block;
		margin-top: 1rem;
		font-size: 0.95rem;
	}

	input[type="checkbox"] {
		margin-right: 0.5rem;
		accent-color: #888;
	}

	select {
		width: 100%;
		margin-top: 0.5rem;
		padding: 0.5rem;
		border: none;
		background-color: var(--alt-surface-color);
		color: var(--text-primary-color);
		border-radius: 4px;
        border: 3px solid var(--border-primary-color);
		resize: vertical;
	}

    button {
        cursor: pointer;
        color: var(--text-primary-color);
        border: 3px solid var(--border-primary-color);
        background-color: var(--alt-surface-color);
        padding-top: 10px;
        padding-bottom: 10px;
        padding-left: 20px;
        padding-right: 20px;
        border-radius: 12px;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    button:hover {
        background-color: #313131;
    }
</style>