<script lang="ts">
    // TYPES
    interface VerifiedData {
        verified: boolean;
    }

    // IMPLEMENTATION
    import { api } from '$lib/api';
    let userId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    let email = 'test~ripplemail.de';

    function bufferToBase64url(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach((b) => binary += String.fromCharCode(b));
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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

    // Enable passkeys
    async function startPasskeyRegistration() {
        const options = await api.post<any>('/auth/webauthn/generate-registration-options', { userId });

        options.challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        options.user.id = Uint8Array.from(atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        if (options.excludeCredentials) { //@ts-ignore
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

        const verifyData = await api.post<VerifiedData>('/auth/webauthn/verify-registration', { userId, credential: attestationResponse });
        if (verifyData.verified) {
            // Possibly do something if successful
        } else {
            // Handle error
        }
    }

    // Login using a passkey
    async function attemptPasskeyLogin() {
        const { options, userId } = await api.post<any>('/auth/webauthn/generate-authentication-options', { email });

        options.challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        if (options.allowCredentials) { //@ts-ignore
            options.allowCredentials = options.allowCredentials.map((cred: PublicKeyCredentialDescriptor) => ({
                ...cred,
                id: typeof cred.id === 'string' ? base64urlToUint8Array(cred.id) : cred.id
            }));
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

        const verifyData = await api.post<VerifiedData>('/auth/webauthn/verify-authentication', { userId, credential: assertionResponse });
        if (verifyData.verified) {
            // Handle successful login
        } else {
            // Handle error
        }
    }
</script>