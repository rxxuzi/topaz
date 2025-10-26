<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import '../styles/statusbar.css';

  export let lineCount: number = 0;
  export let charCount: number = 0;
  export let filePath: string | null = null;
  export let livePreview: boolean = false;
  export let isMarkdown: boolean = false;

  const dispatch = createEventDispatcher();
</script>

<div class="status-bar">
  <div class="status-left">
    <span class="status-item">
      {filePath ? filePath.split(/[\\/]/).pop() : 'Unsaved'}
    </span>
  </div>

  <div class="status-right">
    {#if isMarkdown}
      <button
              class="live-indicator"
              class:active={livePreview}
              on:click={() => dispatch('toggle-live')}
              title="Toggle live preview (Ctrl+L)"
      >
        <span class="live-dot"></span>
        Live
      </button>
    {/if}

    <span class="status-item">Ln {lineCount}</span>
    <span class="status-item">Ch {charCount}</span>

    <button
            class="help-btn"
            on:click={() => dispatch('help')}
            title="Help"
    >
      ?
    </button>

    <button
            class="settings-btn"
            on:click={() => dispatch('settings')}
            title="Settings"
    >
      ⚙
    </button>
  </div>
</div>