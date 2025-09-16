<script lang="ts">
    // TYPES
    interface SetupResponse {
        qr: string;
        secret: string;
    }
    interface ConfirmResponse {
        status: 'success' | 'error';
    }

    // IMPLEMENTATION
    import { api } from '$lib/api';

    let qrCode = $state('');
    let otpSetupSecret = $state('');
    let otpTokenConfirm = $state('');

    // Setting up OTP
    async function setupOtp() {
        const data = await api.post<SetupResponse>('/auth/otp/setup', {});
        qrCode = data.qr;
        otpSetupSecret = data.secret;
    }

    // Validate OTP setup
    async function confirmOtp() {
        const data = await api.post<ConfirmResponse>('/auth/otp/verify', { token: otpTokenConfirm });
        
        if (data.status === 'success') {
            // Do UI stuff ig
        } else {
            // Handle error
        }
    }

    // Disable OTP
    async function disableOtp() {
        const data = await api.post<ConfirmResponse>('/auth/otp/disable', {});
        
        if (data.status === 'success') {
            // Do UI stuff ig
        } else {
            // Handle error
        }
    }
</script>

<!-- QR code and manual code in settings for enabling -->
{#if qrCode}
    <p>Scan this QR code with your authenticator app:</p>
    <img src={qrCode} alt="OTP QR Code" />
    {#if otpSetupSecret}
        <p>Or enter this code manually:</p>
        <code>{otpSetupSecret}</code>
    {/if}
    <input type="text" placeholder="Enter code from app" bind:value={otpTokenConfirm} />
    <button onclick={confirmOtp}>Confirm 2FA</button>
{/if}