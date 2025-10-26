<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import '../styles/settings.css';

  export let settings = {
    defaultFileType: 'md',
    autoSave: true,
    autoSaveDelay: 2000,
    wordWrap: true,
    fontSize: 14,
    tabSize: 4,
    theme: 'auto'
  };

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }

  function updateSetting(key: string, value: any) {
    settings[key] = value;
    dispatch('update', settings);
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<button
        class="settings-overlay"
        on:click={close}
        aria-label="Close settings"
>
  <div
          class="settings-panel"
          on:click|stopPropagation
          role="dialog"
          aria-labelledby="settings-title"
  >
    <div class="settings-header">
      <h1 id="settings-title">Settings</h1>
      <button class="close-btn" on:click={close} aria-label="Close">×</button>
    </div>

    <div class="settings-content">
      <section class="setting-group">
        <h2>Editor</h2>

        <div class="setting-row">
          <label for="fileType">
            <span class="label-text">Default File Type</span>
            <span class="label-desc">New tab extension</span>
          </label>
          <select
                  id="fileType"
                  bind:value={settings.defaultFileType}
                  on:change={() => updateSetting('defaultFileType', settings.defaultFileType)}
          >
            <option value="md">Markdown (.md)</option>
            <option value="txt">Text (.txt)</option>
          </select>
        </div>

        <div class="setting-row">
          <label for="fontSize">
            <span class="label-text">Font Size</span>
          </label>
          <select
                  id="fontSize"
                  bind:value={settings.fontSize}
                  on:change={() => updateSetting('fontSize', settings.fontSize)}
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
          </select>
        </div>

        <div class="setting-row">
          <label for="tabSize">
            <span class="label-text">Tab Size</span>
          </label>
          <select
                  id="tabSize"
                  bind:value={settings.tabSize}
                  on:change={() => updateSetting('tabSize', settings.tabSize)}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>8 spaces</option>
          </select>
        </div>

        <div class="setting-row">
          <span class="label-text">Word Wrap</span>
          <button
                  class="toggle"
                  class:active={settings.wordWrap}
                  on:click={() => updateSetting('wordWrap', !settings.wordWrap)}
                  aria-label="Toggle word wrap"
                  aria-pressed={settings.wordWrap}
          >
            <div class="toggle-thumb"></div>
          </button>
        </div>
      </section>

      <section class="setting-group">
        <h2>Appearance</h2>

        <div class="setting-row">
          <label for="theme">
            <span class="label-text">Theme</span>
          </label>
          <select
                  id="theme"
                  bind:value={settings.theme}
                  on:change={() => updateSetting('theme', settings.theme)}
          >
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </section>

      <section class="setting-group">
        <h2>Advanced</h2>

        <div class="setting-row">
          <span class="label-text">
            <span class="label-text">Auto Save</span>
            <span class="label-desc">Save after typing stops</span>
          </span>
          <button
                  class="toggle"
                  class:active={settings.autoSave}
                  on:click={() => updateSetting('autoSave', !settings.autoSave)}
                  aria-label="Toggle auto save"
                  aria-pressed={settings.autoSave}
          >
            <div class="toggle-thumb"></div>
          </button>
        </div>
      </section>
    </div>
  </div>
</button>