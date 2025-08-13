<script lang="ts">
    import { isLoggedInStore } from '$lib/stores';

    if ($isLoggedInStore) {
        window.location.href = '/inbox';
    }

    let name = '';
    let email = '';
    let password = '';
    
    async function handleSubmit(e: Event) {
        e.preventDefault();

        email = email + '~ripple.com';

        const res = await fetch('http://localhost:3001/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        
        if (data.status === 'success') {
            window.location.href = '/login';
        }
    }
</script>

<div class="signup-container">
    <h1 class="title">Sign up</h1>
    <div class="signup-box">
        <form class="signup-form" on:submit={handleSubmit}>
            <div>
                <label for="name">Name</label>
                <div>
                    <input type="text" name="name" bind:value={name} />
                </div>
            </div>
            <div>
                <label for="email">Email</label>
                <div>
                    <input type="text" name="email" bind:value={email} />
                    ~ripple.com
                </div>
            </div>
            <div>
                <label for="password">Password</label>
                <div>
                    <input type="password" name="password" bind:value={password} />
                </div>
            </div>
            <div>
                <button class="submit-button" type="submit">Sign up</button>
            </div>
        </form>
    </div>
</div>