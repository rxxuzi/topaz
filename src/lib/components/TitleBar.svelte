<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { appWindow } from '@tauri-apps/api/window';
  import '../styles/titlebar.css';

  export let tabs: any[];
  export let activeTabId: string | null;

  const dispatch = createEventDispatcher();

  function getTabTitle(tab: any): string {
    return tab.isDirty ? `${tab.title} •` : tab.title;
  }

  async function minimizeWindow() {
    try {
      await appWindow.minimize();
    } catch (e) {
      console.error('Minimize failed:', e);
    }
  }

  async function maximizeWindow() {
    try {
      await appWindow.toggleMaximize();
    } catch (e) {
      console.error('Maximize failed:', e);
    }
  }

  async function closeWindow() {
    try {
      await appWindow.close();
    } catch (e) {
      console.error('Close failed:', e);
    }
  }

  async function startDrag() {
    try {
      await appWindow.startDragging();
    } catch (e) {
      console.error('Drag failed:', e);
    }
  }
</script>

<div class="titlebar">
  <div class="tab-area">
    <div class="tab-container">
      {#each tabs as tab (tab.id)}
        <button
                class="tab"
                class:active={tab.id === activeTabId}
                on:click={() => dispatch('switch', tab.id)}
        >
          <span class="tab-title">{getTabTitle(tab)}</span>
          <button
                  class="tab-close"
                  on:click|stopPropagation={() => dispatch('close', tab.id)}
          >
            ×
          </button>
        </button>
      {/each}

      <button class="new-tab-btn" on:click={() => dispatch('new')}>
        +
      </button>
    </div>

    <div class="titlebar-spacer" on:mousedown={startDrag}></div>
  </div>

  <div class="window-controls">
    <button class="window-btn minimize" on:click={minimizeWindow} title="Minimize">
      −
    </button>
    <button class="window-btn maximize" on:click={maximizeWindow} title="Maximize">
      □
    </button>
    <button class="window-btn close" on:click={closeWindow} title="Close">
      ×
    </button>
  </div>
</div>