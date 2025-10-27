import {
    Decoration,
    DecorationSet,
    EditorView,
    WidgetType,
    ViewPlugin,
    ViewUpdate
} from '@codemirror/view';
import {Range} from '@codemirror/state';
import katex from 'katex';

let currentView: EditorView | null = null;

function isCursorInRange(view: EditorView, from: number, to: number): boolean {
    const cursorPos = view.state.selection.main.head;
    return cursorPos >= from && cursorPos <= to;
}

function isCursorOnLine(view: EditorView, lineFrom: number, lineTo: number): boolean {
    const cursorPos = view.state.selection.main.head;
    return cursorPos >= lineFrom && cursorPos <= lineTo;
}

class HiddenWidget extends WidgetType {
    toDOM() {
        return document.createElement('span');
    }
}

class CodeBlockHeaderWidget extends WidgetType {
    constructor(
        readonly language: string,
        readonly code: string
    ) {
        super();
    }

    toDOM() {
        const header = document.createElement('div');
        header.className = 'cm-code-header';

        const lang = document.createElement('span');
        lang.className = 'cm-code-lang';
        lang.textContent = this.language || 'text';
        header.appendChild(lang);

        const copy = document.createElement('button');
        copy.className = 'cm-code-copy';
        copy.textContent = 'Copy';
        copy.onclick = async (e) => {
            e.preventDefault();
            try {
                await navigator.clipboard.writeText(this.code);
                copy.textContent = 'Copied!';
                setTimeout(() => copy.textContent = 'Copy', 2000);
            } catch (err) {
                console.error('Copy failed:', err);
            }
        };
        header.appendChild(copy);

        return header;
    }

    eq(other: CodeBlockHeaderWidget) {
        return other.language === this.language && other.code === this.code;
    }
}

class LinkWidget extends WidgetType {
    constructor(
        readonly text: string,
        readonly url: string
    ) {
        super();
    }

    toDOM() {
        const a = document.createElement('a');
        a.textContent = this.text;
        a.href = this.url;
        a.className = 'cm-link';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        return a;
    }

    eq(other: LinkWidget) {
        return other.text === this.text && other.url === this.url;
    }
}

class MathInlineWidget extends WidgetType {
    constructor(
        readonly latex: string,
        readonly from: number,
        readonly to: number
    ) {
        super();
    }

    toDOM() {
        const span = document.createElement('span');
        span.className = 'cm-math-inline';
        span.style.cursor = 'text';

        try {
            katex.render(this.latex, span, {displayMode: false, throwOnError: false});
        } catch (e) {
            span.textContent = this.latex;
            span.className = 'cm-math-error';
        }

        span.onclick = (e) => {
            e.preventDefault();
            if (currentView) {
                currentView.dispatch({
                    selection: {anchor: this.from}
                });
                currentView.focus();
            }
        };

        return span;
    }

    eq(other: MathInlineWidget) {
        return other.latex === this.latex && other.from === this.from;
    }

    ignoreEvent() {
        return false;
    }
}

class MathBlockWidget extends WidgetType {
    constructor(
        readonly latex: string,
        readonly from: number,
        readonly to: number
    ) {
        super();
    }

    toDOM() {
        const div = document.createElement('div');
        div.className = 'cm-math-block';
        div.style.cursor = 'text';

        try {
            katex.render(this.latex, div, {displayMode: true, throwOnError: false});
        } catch (e) {
            div.textContent = this.latex;
            div.className = 'cm-math-error';
        }

        div.onclick = (e) => {
            e.preventDefault();
            if (currentView) {
                currentView.dispatch({
                    selection: {anchor: this.from}
                });
                currentView.focus();
            }
        };

        return div;
    }

    eq(other: MathBlockWidget) {
        return other.latex === this.latex && other.from === this.from;
    }

    ignoreEvent() {
        return false;
    }
}

function buildDecorations(view: EditorView): DecorationSet {
    const decorations: Range<Decoration>[] = [];
    const doc = view.state.doc;
    const text = doc.toString();

    for (let i = 1; i <= doc.lines; i++) {
        const line = doc.line(i);
        const lineText = line.text;

        const headingMatch = lineText.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch && !isCursorOnLine(view, line.from, line.to)) {
            const level = headingMatch[1].length;
            const hashEnd = line.from + headingMatch[1].length;

            decorations.push(
                Decoration.replace({
                    widget: new HiddenWidget()
                }).range(line.from, hashEnd + 1)
            );

            decorations.push(
                Decoration.mark({
                    class: `cm-heading cm-heading-${level}`
                }).range(hashEnd + 1, line.to)
            );
        }
    }

    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    while (match = codeBlockRegex.exec(text)) {
        const from = match.index;
        const to = from + match[0].length;
        const language = match[1];
        const code = match[2];

        if (!isCursorInRange(view, from, to)) {
            const startLine = doc.lineAt(from);
            const endLine = doc.lineAt(to);

            decorations.push(
                Decoration.replace({
                    widget: new CodeBlockHeaderWidget(language, code)
                }).range(startLine.from, startLine.to)
            );

            const codeStartLine = startLine.number + 1;
            const codeEndLine = endLine.number - 1;

            for (let i = codeStartLine; i <= codeEndLine; i++) {
                const line = doc.line(i);
                const isFirst = i === codeStartLine;
                const isLast = i === codeEndLine;
                const className = `cm-code-block${isFirst ? ' cm-code-block-first' : ''}${isLast ? ' cm-code-block-last' : ''}`;

                decorations.push(
                    Decoration.mark({
                        class: className
                    }).range(line.from, line.to)
                );
            }

            decorations.push(
                Decoration.replace({
                    widget: new HiddenWidget()
                }).range(endLine.from, endLine.to)
            );
        }
    }

    const inlineCodeRegex = /`([^`\n]+?)`/g;
    while (match = inlineCodeRegex.exec(text)){
        const from = match.index;
        const to = from + match[0].length;

        if (!isCursorInRange(view, from, to)) {
            decorations.push(
                Decoration.replace({
                    widget: new HiddenWidget()
                }).range(from, from + 1)
            );

            decorations.push(
                Decoration.mark({
                    class: 'cm-inline-code'
                }).range(from + 1, to - 1)
            );

            decorations.push(
                Decoration.replace({
                    widget: new HiddenWidget()
                }).range(to - 1, to)
            );
        }
    }

    const boldRegex = /\*\*(.+?)\*\*/g;
    while (match = boldRegex.exec(text)) {
        const from = match.index;
        const to = from + match[0].length;

        if (!text.substring(from, to).includes('\n') && !isCursorInRange(view, from, to)) {
            decorations.push(
                Decoration.replace({
                    widget: new HiddenWidget()
                }).range(from, from + 2)
            );

            decorations.push(
                Decoration.mark({
                    class: 'cm-strong'
                }).range(from + 2, to - 2)
            );

            decorations.push(
                Decoration.replace({
                    widget: new HiddenWidget()
                }).range(to - 2, to)
            );
        }
    }

    const italicRegex = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g;
    while (match = italicRegex.exec(text)) {
        const from = match.index;
        const to = from + match[0].length;

        if (!text.substring(from, to).includes('\n') && !isCursorInRange(view, from, to)) {
            decorations.push(
                Decoration.replace({
                    widget: new HiddenWidget()
                }).range(from, from + 1)
            );

            decorations.push(
                Decoration.mark({
                    class: 'cm-emphasis'
                }).range(from + 1, to - 1)
            );

            decorations.push(
                Decoration.replace({
                    widget: new HiddenWidget()
                }).range(to - 1, to)
            );
        }
    }

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    while (match = linkRegex.exec(text)) {
        const from = match.index;
        const to = from + match[0].length;
        const linkText = match[1];
        const url = match[2];

        if (!isCursorInRange(view, from, to)) {
            decorations.push(
                Decoration.replace({
                    widget: new LinkWidget(linkText, url)
                }).range(from, to)
            );
        }
    }

    const inlineMathRegex = /(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g;
    while (match = inlineMathRegex.exec(text)) {
        const from = match.index;
        const to = from + match[0].length;
        const latex = match[1].trim();

        if (!isCursorInRange(view, from, to)) {
            decorations.push(
                Decoration.replace({
                    widget: new MathInlineWidget(latex, from, to)
                }).range(from, to)
            );
        }
    }

    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    while (match = blockMathRegex.exec(text)) {
        const from = match.index;
        const to = from + match[0].length;
        const latex = match[1].trim();

        if (!isCursorInRange(view, from, to)) {
            const startLine = doc.lineAt(from);
            const endLine = doc.lineAt(to);

            if (startLine.number === endLine.number) {
                decorations.push(
                    Decoration.replace({
                        widget: new MathBlockWidget(latex, from, to)
                    }).range(from, to)
                );
            } else {
                decorations.push(
                    Decoration.replace({
                        widget: new HiddenWidget()
                    }).range(startLine.from, startLine.to)
                );

                decorations.push(
                    Decoration.replace({
                        widget: new MathBlockWidget(latex, from, to)
                    }).range(startLine.to + 1, endLine.from - 1)
                );

                decorations.push(
                    Decoration.replace({
                        widget: new HiddenWidget()
                    }).range(endLine.from, endLine.to)
                );
            }
        }
    }

    return Decoration.set(decorations.sort((a, b) => a.from - b.from));
}

export const livePreviewPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            currentView = view;
            this.decorations = buildDecorations(view);
        }

        update(update: ViewUpdate) {
            currentView = update.view;
            if (update.docChanged || update.selectionSet || update.viewportChanged) {
                this.decorations = buildDecorations(update.view);
            }
        }

        destroy() {
            currentView = null;
        }
    },
    {
        decorations: (v) => v.decorations
    }
);

export const livePreviewExtension = [livePreviewPlugin];