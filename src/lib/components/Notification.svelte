<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { writable, type Writable } from 'svelte/store';
    import { fly } from 'svelte/transition';

    interface Notification {
        id: number;
        title: string;
        message: string;
        color: string;
    }
    
    const notifications: Writable<Notification[]> = writable([]);
    let notificationId = 0;

    function addNotification(title: string, message: string, color: string) {
        const id = notificationId++;
        notifications.update(x => [...x, { id, title, message, color }]);
        setTimeout(() => removeNotification(id), 5000);
    }

    function removeNotification(id: number) {
        notifications.update(x => x.filter(n => n.id !== id));
    }

    onMount(() => {
        window.createNotification = addNotification;
    });

    onDestroy(() => {
        delete window.createNotification;
    });
</script>

<div class="notification-container">
    {#each $notifications as notification (notification.id)}
        <div class="notification" style="--main-color: {notification.color}" transition:fly={{ x: 300, duration: 200 }}>
            <div class="top-row">
                <div class="content">
                    <h3 class="title">{notification.title}</h3>
                    <p class="message">{notification.message}</p>
                </div>
                <button class="close" on:click={() => removeNotification(notification.id)}>close</button>
            </div>
            <div class="progress-bar"></div>
        </div>
    {/each}
</div>

<style>
    .notification-container {
        position: fixed;
        top: 64px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
    }

    .notification {
        display: flex;
        flex-direction: column;
        position: relative;
        background-color: var(--main-color);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 300px;
    }

    .top-row {
        display: flex;
        align-items: stretch;
    }

    .content {
        flex-grow: 1;
        padding: 12px 16px;
    }

    .title {
        margin: 0;
        font-size: 16px;
        font-weight: bold;
    }

    .message {
        margin: 5px 0 0;
        font-size: 14px;
    }

    .close {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 12px;
        color: var(--text-secondary-color);
    }

    .close:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .progress-bar {
        height: 4px;
        background-color: color-mix(in srgb, var(--main-color) 70%, white);
        transform-origin: right center;
        animation: shrinkBar 5s linear forwards;
    }

    @keyframes shrinkBar {
        from {
            transform: scaleX(1);
        }
        to {
            transform: scaleX(0);
        }
    }
</style>