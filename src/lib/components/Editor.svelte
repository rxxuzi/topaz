<script lang="ts">
  import { createEventDispatcher, afterUpdate } from 'svelte';
  import { marked } from 'marked';
  import katex from 'katex';
  import '../styles/editor.css';

  export let content: string = '';
  export let filePath: string | null = null;
  export let livePreview: boolean = false;

  const dispatch = createEventDispatcher();

  let renderedHtml = '';
  let textareaElement: HTMLTextAreaElement;
  let liveInputElement: HTMLTextAreaElement;
  let liveOutputElement: HTMLDivElement;

  $: isMarkdown = filePath?.endsWith('.md') || filePath?.includes('Untitled') || false;
  $: lineCount = content.split('\n').length;
  $: charCount = content.length;
  $: dispatch('stats', { lineCount, charCount });

  $: if (livePreview && isMarkdown) {
    renderMarkdown(content);
  }

  afterUpdate(() => {
    if (livePreview && liveInputElement && liveOutputElement) {
      liveInputElement.addEventListener('scroll', syncScroll);
    }
  });

  function syncScroll() {
    if (liveOutputElement && liveInputElement) {
      liveOutputElement.scrollTop = liveInputElement.scrollTop;
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    dispatch('change', target.value);
  }

  function renderMarkdown(text: string) {
    try {
      let processed = text;

      processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false
          });
        } catch {
          return `<span class="math-error">${match}</span>`;
        }
      });

      processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false
          });
        } catch {
          return `<span class="math-error">${match}</span>`;
        }
      });

      renderedHtml = marked.parse(processed) as string;
    } catch {
      renderedHtml = '<p class="error">Render error</p>';
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    const textarea = livePreview ? liveInputElement : textareaElement;
    if (!textarea) return;

    if (e.key === 'Tab') {
      e.preventDefault();

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent = content.substring(0, start) + '\t' + content.substring(end);
      dispatch('change', newContent);

      setTimeout(() => {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1;
        textarea.focus();
      }, 0);
    }

    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault();
      insertMath();
    }
  }

  function insertMath() {
    const textarea = livePreview ? liveInputElement : textareaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const mathTemplate = selectedText ? `$${selectedText}$` : '$$\n\n$$';
    const newContent = content.substring(0, start) + mathTemplate + content.substring(end);

    dispatch('change', newContent);

    setTimeout(() => {
      const cursorPos = selectedText ? start + selectedText.length + 2 : start + 3;
      textarea.selectionStart = cursorPos;
      textarea.selectionEnd = cursorPos;
      textarea.focus();
    }, 0);
  }
</script>

<div class="editor-wrapper">
  {#if livePreview && isMarkdown}
    <div class="live-editor-container">
      <textarea
              bind:this={liveInputElement}
              class="live-input"
              value={content}
              on:input={handleInput}
              on:keydown={handleKeyDown}
              spellcheck="false"
      />

      <div class="live-output" bind:this={liveOutputElement}>
        {@html renderedHtml}
      </div>
    </div>
  {:else}
    <textarea
            bind:this={textareaElement}
            class="editor-textarea"
            value={content}
            on:input={handleInput}
            on:keydown={handleKeyDown}
            placeholder="Start typing..."
            spellcheck="false"
    />
  {/if}
</div>