<script lang="ts">
    import { isLoggedInStore, userStore } from '$lib/stores';
    import Notification from '$lib/components/Notification.svelte';
    import { API_URL } from '$lib/config';

    if ($isLoggedInStore) {
        window.location.href = '/inbox';
    }

    let signup = $state(false);

    let name = $state('');
    let email = $state('');
    let password = $state('');

    let showTotp = $state(false);
    let totpToken = $state('');
    let pendingUserId = '';

    function bufferToBase64url(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach((b) => binary += String.fromCharCode(b));

        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    function base64urlToUint8Array(base64Url: string): Uint8Array {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(base64Url.length + (4 - base64Url.length % 4) % 4, '=');
        const binaryString = atob(base64);
        const buffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            buffer[i] = binaryString.charCodeAt(i);
        }

        return buffer;
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();

        if (!signup) {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.status === 'totp_required') {
                pendingUserId = data.user.id;
                showTotp = true;
            } else if (data.status === 'success') {
                isLoggedInStore.set(true);
                userStore.set(data.user);
                window.location.href = '/inbox';
            }
        } else {
            email = email + '~ripple.com';

            const res = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (data.status === 'success') {
                signup = false;
            }
        }
    }

    async function submitTotp(e: Event) {
        e.preventDefault();

        const res = await fetch(`${API_URL}/login/totp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: pendingUserId, token: totpToken })
        });

        const data = await res.json();

        if (data.status === 'success') {
            isLoggedInStore.set(true);
            userStore.set(data.user);
            window.location.href = '/inbox';
        } else {
            window.createNotification?.('Auth failed', 'Your TOTP authentication failed. Please try again or contact support', '#f93943');
        }
    }

    async function attemptPasskeyLogin(email: string) {
        const res = await fetch(`${API_URL}/auth/webauthn/generate-authentication-options`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const { options, userId } = await res.json();

        options.challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        if (options.allowCredentials) { //@ts-ignore
            options.allowCredentials = options.allowCredentials.map((cred: PublicKeyCredentialDescriptor) => ({
                ...cred,
                id: typeof cred.id === 'string' ? base64urlToUint8Array(cred.id) : cred.id
            }));
            console.log(options.allowCredentials);
        }

        const cred = await navigator.credentials.get({ publicKey: options });
        
        if (!cred || cred?.type !== 'public-key') {
            throw new Error('Invalid credential');
        }

        const credential = cred as PublicKeyCredential;
        const assertionCred = credential.response as AuthenticatorAssertionResponse; 

        const assertionResponse = {
            id: credential.id,
            rawId: bufferToBase64url(credential.rawId),
            response: {
                authenticatorData: bufferToBase64url(assertionCred.authenticatorData),
                clientDataJSON: bufferToBase64url(assertionCred.clientDataJSON),
                signature: bufferToBase64url(assertionCred.signature),
                userHandle: assertionCred.userHandle ? bufferToBase64url(assertionCred.userHandle) : null
            },
            type: credential.type
        }

        const verifyRes = await fetch(`${API_URL}/auth/webauthn/verify-authentication`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, credential: assertionResponse })
        });

        const verifyData = await verifyRes.json();

        if (verifyData.verified) {
            const userRes = await fetch(`${API_URL}/users/${userId}`);
            const user = await userRes.json();
            isLoggedInStore.set(true);
            userStore.set(user.user);
            window.location.href = '/inbox';
        } else {
            window.createNotification?.('Passkey login failed', 'Could not authenticate with passkey.', '#f93943');
            console.log(verifyData);
        }
    }
</script>

<svelte:head>
    <title>Login - Ripple</title>
</svelte:head>

<div class="login-container">
    <div class="login-box">
        <form class="login-form" onsubmit={handleSubmit}>
            <div class="header">
                <div class="title">
                    <p>{signup ? 'Sign up' : 'Login'}</p>
                </div>
                <div class="signup">
                    <a href='/login' onclick={(e) => {
                        e.preventDefault();
                        signup = !signup;
                    }}>{signup ? 'Login' : 'Sign up'}</a>
                </div>
            </div>
            <div class="input-container">
                {#if signup}
                    <div class="input-group full">
                        <label for="name">Name</label>
                        <div>
                            <input type="text" name="name" bind:value={name} />
                        </div>
                    </div>
                {/if}
                <div class="input-group">
                    <label for="email">Email</label>
                    <div>
                        <input type="text" name="email" bind:value={email} />
                        {#if signup}
                            ~ripple.com
                        {/if}
                    </div>
                </div>
                <div class="input-group full">
                    <label for="password">Password</label>
                    <div>
                        <input type="password" name="password" bind:value={password} />
                    </div>
                </div>
            </div>
            <div class="button-container">
                <button class="submit-button" type="submit">{signup ? 'Sign up' : 'Login'}</button>
                {#if !signup}
                    <button type="button" onclick={() => attemptPasskeyLogin(email)}>Login with Passkey</button>
                {/if}
            </div>
        </form>
    </div>
</div>
{#if showTotp}
    <form onsubmit={submitTotp}>
        <div class="input-group full">
            <label for="totp">Enter 2FA Code</label>
            <div>
                <input type="text" bind:value={totpToken} name="totp" />
            </div>
        </div>
        <div class="button-container">
            <button type="submit">Verify 2FA</button>
        </div>
    </form>
{/if}

<Notification />

<style>
    .login-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }

    .login-box {
        display: flex;
        flex-direction: column;
        padding: 20px;
        background-color: var(--alt-surface-color);
        border-radius: 16px;
        border: 3px solid var(--border-primary-color);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .signup {
        margin-top: 7px;
    }

    .signup a {
        color: var(--text-primary-color);
    }

    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .title {
        font-size: 1.5rem;
        font-weight: bold;
        text-align-last: center;
        margin-top: -23px;
    }

    .input-container {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .full input {
        width: calc(100% - 20px);
    }

    label {
        font-weight: bold;
        color: var(--text-primary-color);
    }

    input {
        padding: 8px;
        border: 2px solid var(--border-secondary-color);
        border-radius: 8px;
        color: var(--text-primary-color);
        background-color: var(--surface-color);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .button-container {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 15px;
        align-items: center;
        justify-content: center;
        margin-top: 15px;
    }

    button {
        cursor: pointer;
        color: var(--text-primary-color);
        border: 3px solid var(--border-secondary-color);
        background-color: var(--alt-surface-color);
        padding-top: 10px;
        padding-bottom: 10px;
        padding-left: 20px;
        padding-right: 20px;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
</style>