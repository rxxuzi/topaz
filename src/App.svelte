<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/tauri';
  import { listen } from '@tauri-apps/api/event';
  import TitleBar from './lib/components/TitleBar.svelte';
  import Editor from './lib/components/Editor.svelte';
  import StatusBar from './lib/components/StatusBar.svelte';
  import Settings from './lib/components/Settings.svelte';
  import Help from './lib/components/Help.svelte';

  interface Tab {
    id: string;
    title: string;
    path: string | null;
    content: string;
    isDirty: boolean;
  }

  let tabs: Tab[] = [];
  let activeTabId: string | null = null;
  let livePreview: boolean = false;
  let lineCount: number = 0;
  let charCount: number = 0;
  let showSettings: boolean = false;
  let showHelp: boolean = false;
  let autoSaveTimeout: number | null = null;

  let settings = {
    defaultFileType: 'md',
    autoSave: true,
    autoSaveDelay: 2000,
    wordWrap: true,
    fontSize: 14,
    tabSize: 4,
    theme: 'auto'
  };

  onMount(() => {
    createNewTab();
    listen('open-file', (event: any) => {
      openFile(event.payload);
    });
    loadSettings();
  });

  function loadSettings() {
    const saved = localStorage.getItem('topaz-settings');
    if (saved) {
      settings = { ...settings, ...JSON.parse(saved) };
    }
  }

  function saveSettings() {
    localStorage.setItem('topaz-settings', JSON.stringify(settings));
  }

  function createNewTab() {
    const ext = settings.defaultFileType;
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: `Untitled.${ext}`,
      path: null,
      content: '',
      isDirty: false
    };
    tabs = [...tabs, newTab];
    activeTabId = newTab.id;
  }

  function closeTab(tabId: string) {
    const index = tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    tabs = tabs.filter(t => t.id !== tabId);

    if (tabs.length > 0) {
      activeTabId = index < tabs.length ? tabs[index].id : tabs[tabs.length - 1].id;
    } else {
      createNewTab();
    }
  }

  function switchTab(tabId: string) {
    activeTabId = tabId;
  }

  async function openFile(path?: string) {
    try {
      const filePath = path || await invoke<string | null>('open_file_dialog');
      if (!filePath) return;

      const content = await invoke<string>('read_file', { path: filePath });
      const fileName = filePath.split(/[\\/]/).pop() || 'Untitled';

      const existingTab = tabs.find(t => t.path === filePath);
      if (existingTab) {
        activeTabId = existingTab.id;
        return;
      }

      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        title: fileName,
        path: filePath,
        content,
        isDirty: false
      };

      tabs = [...tabs, newTab];
      activeTabId = newTab.id;
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }

  async function saveFile(tabId?: string) {
    const targetTabId = tabId || activeTabId;
    const targetTab = tabs.find(t => t.id === targetTabId);
    if (!targetTab) return;

    try {
      let filePath = targetTab.path;

      if (!filePath) {
        filePath = await invoke<string | null>('save_file_dialog');
        if (!filePath) return;
      }

      await invoke('write_file', { path: filePath, content: targetTab.content });

      const fileName = filePath.split(/[\\/]/).pop() || 'Untitled';
      tabs = tabs.map(t => t.id === targetTabId ? {
        ...t,
        path: filePath,
        title: fileName,
        isDirty: false
      } : t);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }

  function handleContentChange(event: CustomEvent<string>) {
    tabs = tabs.map(t => t.id === activeTabId ? {
      ...t,
      content: event.detail,
      isDirty: true
    } : t);

    if (settings.autoSave && activeTab?.path) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      autoSaveTimeout = setTimeout(() => {
        saveFile(activeTabId);
      }, settings.autoSaveDelay);
    }
  }

  function handleStats(event: CustomEvent<{lineCount: number, charCount: number}>) {
    lineCount = event.detail.lineCount;
    charCount = event.detail.charCount;
  }

  function toggleLivePreview() {
    livePreview = !livePreview;
  }

  function handleSettingsUpdate(event: CustomEvent) {
    settings = event.detail;
    saveSettings();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      openFile();
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      createNewTab();
    }
    if (e.ctrlKey && e.key === 'w') {
      e.preventDefault();
      if (activeTabId) closeTab(activeTabId);
    }
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      toggleLivePreview();
    }
    if (e.ctrlKey && e.key === ',') {
      e.preventDefault();
      showSettings = true;
    }
    if (e.key === 'F1') {
      e.preventDefault();
      showHelp = true;
    }
  }

  $: activeTab = tabs.find(t => t.id === activeTabId);
  $: isMarkdown = activeTab?.path?.endsWith('.md') || activeTab?.title?.endsWith('.md') || false;
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app">
  <TitleBar
          {tabs}
          {activeTabId}
          on:switch={e => switchTab(e.detail)}
          on:close={e => closeTab(e.detail)}
          on:new={createNewTab}
  />

  <div class="editor-container">
    {#if activeTab}
      <Editor
              content={activeTab.content}
              filePath={activeTab.path}
              {livePreview}
              on:change={handleContentChange}
              on:stats={handleStats}
      />
    {/if}
  </div>

  <StatusBar
          {lineCount}
          {charCount}
          filePath={activeTab?.path}
          {livePreview}
          {isMarkdown}
          on:toggle-live={toggleLivePreview}
          on:help={() => showHelp = true}
          on:settings={() => showSettings = true}
  />

  {#if showHelp}
    <Help on:close={() => showHelp = false} />
  {/if}

  {#if showSettings}
    <Settings
            {settings}
            on:close={() => showSettings = false}
            on:update={handleSettingsUpdate}
    />
  {/if}
</div>

<style>
  .app {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    overflow: hidden;
  }

  .editor-container {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>