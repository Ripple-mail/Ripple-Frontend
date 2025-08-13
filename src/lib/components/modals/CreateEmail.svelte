<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { userStore } from '$lib/stores';
    import mime from 'mime';
    import Notification from '../Notification.svelte';
	import { API_URL } from '$lib/config';

    let { showModal = $bindable() } = $props();

    let from = $userStore.email;
    let rcpt = $state('');
    let subject = $state('');
    let body = $state('');
    let attachments: File[] = $state([]);

    const chunkSize = 1024 * 1024;
    let isDragging = $state(false);

    onMount(() => {
        window.addEventListener('keydown', handleEscape);
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleEscape);
    });

    function closePopup() {
        showModal = false;
        rcpt = '';
        subject = '';
        body = '';
    }

    function handleEscape(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            closePopup();
        }
    }

    async function createEmail(e: Event) {
        e.preventDefault();

        if (!rcpt) return alert('Recipient is required.');

        let fileHashes: string[] = [];

        if (attachments.length > 0) {
            fileHashes = await Promise.all(attachments.map(file => uploadFile(file).then(res => res.path)));
        }

        body = body.replace('\n', '\r\n');

        const payload = JSON.stringify({ from, rcpt, subject, body, fileHashes });

        const res = await fetch(`${API_URL}/users/${$userStore.id}/mail/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });

        const data = await res.json();
        if (data.status === 'success') {
            closePopup();
        }
    }

    function handleFiles(e: Event) {
        const files = (e.target as HTMLInputElement).files;
        if (!files) return;

        attachments = [...attachments, ...Array.from(files)];
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        isDragging = false;

        if (e.dataTransfer?.files) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            attachments = [...attachments, ...droppedFiles];
        }
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        isDragging = true;
    }

    function removeAttachment(index: number) {
        attachments.splice(index, 1);
        attachments = [...attachments];
    }

    async function uploadFile(file: File) {
        if (!file) return;

        const totalSize = file.size;
        const fileName = file.name;
        const totalChunks = Math.ceil(totalSize / chunkSize);
        const uploadId = crypto.randomUUID();
        const fileType = mime.getExtension(file.type);
        if (!fileType) return;

        let finalResponse;

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, totalSize);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('uploadId', uploadId);
            formData.append('chunkIndex', i.toString());
            formData.append('totalChunks', totalChunks.toString());
            formData.append('fileType', fileType);
            formData.append('file', chunk, `chunk-${i}`);
            formData.append('fileName', fileName);

            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                console.error(await res.json());
                alert(`Failed on chunk ${i + 1}`);
                return;
            } else {
                if (i + 1 < totalChunks) console.log(`Uploading chunk ${i + 1} of ${totalChunks}`);
                else {
                    finalResponse = await res.json();
                    window.createNotification?.('Uploaded file', `Successfully uploaded file ${fileName}`, '#77DD77');
                }
            }
        }

        return finalResponse;
    }
</script>

{#if showModal}
    <div class="create-container" ondragover={handleDragOver} ondragleave={() => isDragging = false} ondrop={handleDrop} class:is-dragging={isDragging} role="group">
        {#if isDragging}
            <div class="drag-overlay">
                <p>Drop files to attach</p>
            </div>
        {/if}
        <form class="create-form" onsubmit={createEmail}>
            <div class="header">
                <div class="title">
                    <p>Send Email</p>
                </div>
                <button class="close-popup" onclick={() => showModal = false}>X</button>
            </div>
            <div class="input-container">
                <div class="input-group">
                    <label for="rcpt">To</label>
                    <input type="text" name="rcpt" bind:value={rcpt} />
                </div>
                <div class="input-group">
                    <label for="subject">Subject</label>
                    <input type="text" name="subject" bind:value={subject} />
                </div>
                <div class="input-group">
                    <label for="body">Body</label>
                    <div>
                        <textarea name="body" placeholder="Body text" rows=12 cols=214 bind:value={body}></textarea>
                    </div>
                </div>
                <div class="input-group">
                    <label for="attachments">Attachments</label>
                    <input type="file" id="attachments" multiple onchange={handleFiles} />
                    <ul class="attachment-list">
                        {#each attachments as file, index}
                            <li>
                                {file.name} ({Math.round(file.size / 1024) > 1024 ? Math.round(file.size / (1024 * 1024)) > 1024 ? (Math.round((file.size * 10) / (1024 * 1024 * 1024)) / 10) + ' GB' : (Math.round((file.size * 100) / (1024 * 1024)) / 100) + ' MB' : Math.round(file.size / 1024) + ' KB'})
                                <button type="button" onclick={() => removeAttachment(index)}>X</button>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
            <div class="button-container">
                <button class="submit-button" type="submit">Send</button>
            </div>
        </form>
    </div>

    <Notification />
{/if}

<style>
    .create-container {
        display: flex;
        flex-direction: column;
        padding: 20px;
        background: var(--surface-color);
        border-radius: 16px;
        border: 3px solid var(--border-primary-color);
        box-shadow: 0 4px 6px var(--box-shadow);
        height: 84%;
        overflow-y: auto;
        width: 84%;
        max-height: 90vh;
    }

    .create-container.is-dragging {
        outline: 2px dashed var(--border-secondary-color);
        outline-offset: -8px;
        position: relative;
    }

    .drag-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 1.5rem;
        font-weight: bold;
        border-radius: 16px;
        pointer-events: none;
        z-index: 10;
        backdrop-filter: blur(4px);
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

    label {
        font-weight: bold;
        color: var(--text-primary-color);
    }

    input, textarea {
        padding: 8px;
        border: 2px solid var(--border-secondary-color);
        border-radius: 8px;
        color: var(--text-primary-color);
        background-color: var(--surface-color);
        box-shadow: 0 4px 6px var(--box-shadow);
    }

    .button-container {
        position: relative;
        display: flex;
        flex-direction: row;
        gap: 40px;
        align-items: flex-end;
        justify-content: center;
        margin-top: 15px;
    }

    button {
        cursor: pointer;
        color: var(--text-primary-color);
        border: 3px solid var(--border-secondary-color);
        background-color: var(--surface-color);
        padding-top: 10px;
        padding-bottom: 10px;
        padding-left: 20px;
        padding-right: 20px;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: bold;
        box-shadow: 0 4px 6px var(--box-shadow);
    }

    button:hover {
        background-color: var(--alt-surface-color);
    }

    .close-popup {
        border-radius: 100%;
        width: 45px;
        height: 45px;
        padding: 0;
    }

    input[type="file"] {
        border: none;
        color: var(--text-primary-color);
        background: transparent;
        margin-top: 4px;
        cursor: pointer;
    }

    .attachment-list {
        list-style: none;
        padding-left: 0;
        margin-top: 10px;
        overflow-y: auto;
    }

    .attachment-list li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--alt-surface-color);
        padding: 6px 12px;
        margin-top: 6px;
        border-radius: 6;
        color: var(--text-primary-color);
        font-size: 0.9rem;
        box-shadow: 0 2px 4px var(--box-shadow);
    }

    .attachment-list li button {
        background: none;
        border: none;
        color: var(--text-primary-color);
        font-size: 1rem;
        cursor: pointer;
        margin-left: 8px;
    }
</style>