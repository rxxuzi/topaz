<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { defaultKeymap, indentWithTab } from '@codemirror/commands';
  import { markdown } from '@codemirror/lang-markdown';
  import { livePreviewExtension } from '../editor/preview.ts';
  import { topazTheme } from '../editor/theme';

  export let content: string = '';
  export let filePath: string | null = null;
  export let livePreview: boolean = false;

  const dispatch = createEventDispatcher();

  let editorElement: HTMLDivElement;
  let editorView: EditorView | null = null;
  let lastLivePreview = false;

  function checkIsMarkdown(path: string | null): boolean {
    if (!path) return true; // pathがnullなら常にMarkdownとして扱う
    return path.endsWith('.md') || path.includes('Untitled');
  }

  $: isMarkdown = checkIsMarkdown(filePath);

  function createExtensions() {
    console.log('[Editor] Creating extensions, livePreview:', livePreview, 'isMarkdown:', isMarkdown, 'filePath:', filePath);

    const extensions = [
      keymap.of([
        ...defaultKeymap,
        indentWithTab,
        {
          key: 'Mod-b',
          run: (view) => {
            wrapSelection(view, '**', '**');
            return true;
          }
        },
        {
          key: 'Mod-i',
          run: (view) => {
            wrapSelection(view, '*', '*');
            return true;
          }
        },
        {
          key: 'Mod-m',
          run: (view) => {
            insertMath(view);
            return true;
          }
        }
      ]),
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString();
          content = newContent;
          dispatch('change', newContent);
          updateStats(newContent);
        }
      }),
      topazTheme,
      EditorView.lineWrapping,
      markdown(), // 常にMarkdownサポートを有効化
    ];

    if (livePreview) {
      console.log('[Editor] ✅ Adding live preview extension');
      extensions.push(...livePreviewExtension);
    } else {
      console.log('[Editor] ❌ Live preview disabled');
    }

    return extensions;
  }

  function wrapSelection(view: EditorView, before: string, after: string) {
    const selection = view.state.selection.main;
    const selectedText = view.state.doc.sliceString(selection.from, selection.to);

    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: before + selectedText + after
      },
      selection: {
        anchor: selection.from + before.length,
        head: selection.to + before.length
      }
    });

    view.focus();
  }

  function insertMath(view: EditorView) {
    const selection = view.state.selection.main;
    const selectedText = view.state.doc.sliceString(selection.from, selection.to);

    const mathTemplate = selectedText ? `$${selectedText}$` : '$$\n\n$$';

    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: mathTemplate
      },
      selection: {
        anchor: selectedText
                ? selection.from + selectedText.length + 2
                : selection.from + 3
      }
    });

    view.focus();
  }

  function updateStats(text: string) {
    const lineCount = text.split('\n').length;
    const charCount = text.length;
    dispatch('stats', { lineCount, charCount });
  }

  onMount(() => {
    console.log('[Editor] 🚀 Mounting, livePreview:', livePreview, 'filePath:', filePath);

    const state = EditorState.create({
      doc: content,
      extensions: createExtensions()
    });

    editorView = new EditorView({
      state,
      parent: editorElement
    });

    updateStats(content);
    lastLivePreview = livePreview;
  });

  onDestroy(() => {
    editorView?.destroy();
  });

  // livePreviewが変更されたときのみ再構成
  $: if (editorView && livePreview !== lastLivePreview) {
    console.log('[Editor] 🔄 Live preview toggled:', livePreview);
    lastLivePreview = livePreview;

    // エディタを完全に再作成
    const currentContent = editorView.state.doc.toString();
    const currentSelection = editorView.state.selection.main;

    editorView.destroy();

    const state = EditorState.create({
      doc: currentContent,
      extensions: createExtensions(),
      selection: { anchor: currentSelection.anchor, head: currentSelection.head }
    });

    editorView = new EditorView({
      state,
      parent: editorElement
    });

    console.log('[Editor] ✨ Editor recreated with livePreview:', livePreview);
  }
</script>

<div class="codemirror-wrapper">
  <div bind:this={editorElement} class="codemirror-editor"></div>
</div>

<style>
  .codemirror-wrapper {
    flex: 1;
    display: flex;
    overflow: hidden;
    background: var(--bg-primary);
    position: relative;
  }

  .codemirror-editor {
    flex: 1;
    height: 100%;
    overflow: auto;
  }

  :global(.cm-editor) {
    height: 100%;
    outline: none;
  }

  :global(.cm-scroller) {
    overflow: auto;
    font-family: var(--font-mono);
  }

  :global(.cm-content) {
    padding: 20px 24px;
    caret-color: var(--accent);
  }

  :global(.cm-line) {
    padding: 0;
  }
</style>