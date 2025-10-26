<script lang="ts">
  import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
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
  let isScrollSyncing = false;

  $: isMarkdown = filePath?.endsWith('.md') || filePath?.includes('Untitled') || false;
  $: lineCount = content.split('\n').length;
  $: charCount = content.length;

  $: {
    dispatch('stats', { lineCount, charCount });
  }

  $: {
    if (livePreview && isMarkdown) {
      renderMarkdown(content);
    }
  }

  onMount(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  });

  afterUpdate(() => {
    if (livePreview && liveInputElement && liveOutputElement && !isScrollSyncing) {
      syncScroll();
    }
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    dispatch('change', target.value);
  }

  function renderMarkdown(text: string) {
    if (!text) {
      renderedHtml = '';
      return;
    }

    try {
      let processed = text;

      processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
        try {
          const rendered = katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false
          });
          return `<div class="math-block">${rendered}</div>`;
        } catch (e) {
          console.error('KaTeX block error:', e);
          return `<div class="math-error">${match}</div>`;
        }
      });

      processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false
          });
        } catch (e) {
          console.error('KaTeX inline error:', e);
          return `<span class="math-error">${match}</span>`;
        }
      });

      const parsed = marked.parse(processed);
      renderedHtml = typeof parsed === 'string' ? parsed : '';
    } catch (e) {
      console.error('Markdown render error:', e);
      renderedHtml = '<p class="error">Render error</p>';
    }
  }

  function syncScroll() {
    if (!liveOutputElement || !liveInputElement || isScrollSyncing) return;

    isScrollSyncing = true;
    const scrollPercentage = liveInputElement.scrollTop /
            Math.max(liveInputElement.scrollHeight - liveInputElement.clientHeight, 1);
    liveOutputElement.scrollTop = scrollPercentage *
            (liveOutputElement.scrollHeight - liveOutputElement.clientHeight);

    setTimeout(() => {
      isScrollSyncing = false;
    }, 10);
  }

  function handleScroll() {
    if (!isScrollSyncing) {
      syncScroll();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    const textarea = livePreview ? liveInputElement : textareaElement;
    if (!textarea) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    ';

      const newContent = content.substring(0, start) + spaces + content.substring(end);
      dispatch('change', newContent);

      setTimeout(() => {
        textarea.selectionStart = start + spaces.length;
        textarea.selectionEnd = start + spaces.length;
        textarea.focus();
      }, 0);
    }

    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault();
      insertMath();
    }

    if (e.key === 'Enter') {
      const start = textarea.selectionStart;
      const lines = content.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];

      const bulletMatch = currentLine.match(/^(\s*[-*+]\s+)/);
      if (bulletMatch) {
        e.preventDefault();
        const prefix = bulletMatch[1];
        const newContent = content.substring(0, start) + '\n' + prefix + content.substring(start);
        dispatch('change', newContent);

        setTimeout(() => {
          textarea.selectionStart = start + 1 + prefix.length;
          textarea.selectionEnd = start + 1 + prefix.length;
          textarea.focus();
        }, 0);
        return;
      }

      const numberMatch = currentLine.match(/^(\s*)(\d+)\.\s+/);
      if (numberMatch) {
        e.preventDefault();
        const indent = numberMatch[1];
        const number = parseInt(numberMatch[2]) + 1;
        const prefix = `${indent}${number}. `;
        const newContent = content.substring(0, start) + '\n' + prefix + content.substring(start);
        dispatch('change', newContent);

        setTimeout(() => {
          textarea.selectionStart = start + 1 + prefix.length;
          textarea.selectionEnd = start + 1 + prefix.length;
          textarea.focus();
        }, 0);
      }
    }

    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      wrapSelection('**', '**');
    }

    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      wrapSelection('*', '*');
    }
  }

  function wrapSelection(before: string, after: string) {
    const textarea = livePreview ? liveInputElement : textareaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    dispatch('change', newContent);

    setTimeout(() => {
      if (selectedText) {
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = end + before.length;
      } else {
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length;
      }
      textarea.focus();
    }, 0);
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
      <div class="live-output" bind:this={liveOutputElement}>
        {@html renderedHtml}
      </div>

      <textarea
              bind:this={liveInputElement}
              class="live-input"
              value={content}
              on:input={handleInput}
              on:keydown={handleKeyDown}
              on:scroll={handleScroll}
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
      />
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
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
    />
  {/if}
</div>