<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import '../styles/help.css';

    const dispatch = createEventDispatcher();

    function close() {
        dispatch('close');
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            close();
        }
    }

    const version = '0.1.0';
    const author = 'rxxuzi';
    const repository = 'https://github.com/rxxuzi/topaz';

    const shortcuts = [
        { desc: 'New tab', keys: ['Ctrl', 'N'] },
        { desc: 'Open file', keys: ['Ctrl', 'O'] },
        { desc: 'Save file', keys: ['Ctrl', 'S'] },
        { desc: 'Close tab', keys: ['Ctrl', 'W'] },
        { desc: 'Toggle live preview', keys: ['Ctrl', 'L'] },
        { desc: 'Insert math template', keys: ['Ctrl', 'M'] },
        { desc: 'Bold text', keys: ['Ctrl', 'B'] },
        { desc: 'Italic text', keys: ['Ctrl', 'I'] },
        { desc: 'Settings', keys: ['Ctrl', ','] },
        { desc: 'Help', keys: ['F1'] }
    ];
</script>

<svelte:window on:keydown={handleKeydown} />

<button
        class="help-overlay"
        on:click={close}
        aria-label="Close help"
>
    <div
            class="help-panel"
            on:click|stopPropagation
            role="dialog"
            aria-labelledby="help-title"
    >
        <div class="help-header">
            <h1 id="help-title">Help</h1>
            <button class="close-btn" on:click={close} aria-label="Close">×</button>
        </div>

        <div class="help-content">
            <section class="help-section">
                <div class="logo-container">
                    <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="80" height="80" aria-hidden="true">
                        <defs>
                            <linearGradient id="topazGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:#FFB84D;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#FF8C00;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <polygon points="90,50 210,50 270,130 150,280 30,130"
                                 fill="url(#topazGradient)"
                                 stroke="none"/>
                    </svg>
                    <div class="app-title">Topaz</div>
                    <div class="app-subtitle">The Text Editor</div>
                </div>

                <div class="info-grid">
                    <span class="info-label">Version</span>
                    <span class="info-value">{version}</span>

                    <span class="info-label">Author</span>
                    <span class="info-value">{author}</span>

                    <span class="info-label">Repository</span>
                    <span class="info-value">
                        <a href={repository} class="link" target="_blank" rel="noopener">
                            GitHub
                        </a>
                    </span>
                </div>
            </section>

            <section class="help-section">
                <h2>Keyboard Shortcuts</h2>
                <div class="shortcut-list">
                    {#each shortcuts as shortcut}
                        <div class="shortcut-item">
                            <span class="shortcut-desc">{shortcut.desc}</span>
                            <div class="shortcut-keys">
                                {#each shortcut.keys as key}
                                    <kbd class="key">{key}</kbd>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        </div>
    </div>
</button>