import { EditorView } from '@codemirror/view';

export const topazTheme = EditorView.theme({
    '&': {
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        height: '100%'
    },

    '.cm-content': {
        fontFamily: 'var(--font-mono)',
        fontSize: '15px',
        lineHeight: '1.7',
        caretColor: 'var(--accent)',
        padding: '20px 24px'
    },

    '.cm-line': {
        padding: '0'
    },

    '&.cm-focused': {
        outline: 'none'
    },

    '.cm-cursor': {
        borderLeftColor: 'var(--accent)',
        borderLeftWidth: '2px'
    },

    '.cm-selectionBackground': {
        backgroundColor: 'rgba(0, 102, 204, 0.2)'
    },

    '&.cm-focused .cm-selectionBackground': {
        backgroundColor: 'rgba(0, 102, 204, 0.2)'
    },

    '.cm-activeLine': {
        backgroundColor: 'transparent'
    },

    '.cm-activeLineGutter': {
        backgroundColor: 'transparent'
    },

    '.cm-heading': {
        fontFamily: 'var(--font-ui)',
        fontWeight: '600',
        letterSpacing: '-0.02em',
        lineHeight: '1.3',
        color: 'var(--text-primary)',
        display: 'inline-block'
    },

    '.cm-heading-1': {
        fontSize: '2em',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border)',
        width: '100%',
        marginTop: '24px',
        marginBottom: '16px'
    },

    '.cm-heading-2': {
        fontSize: '1.5em',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border)',
        width: '100%',
        marginTop: '24px',
        marginBottom: '16px'
    },

    '.cm-heading-3': {
        fontSize: '1.25em',
        marginTop: '24px',
        marginBottom: '16px'
    },

    '.cm-heading-4': {
        fontSize: '1em',
        marginTop: '24px',
        marginBottom: '16px'
    },

    '.cm-heading-5': {
        fontSize: '0.875em',
        marginTop: '24px',
        marginBottom: '16px'
    },

    '.cm-heading-6': {
        fontSize: '0.85em',
        color: 'var(--text-secondary)',
        marginTop: '24px',
        marginBottom: '16px'
    },

    '.cm-code-header': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '6px 6px 0 0',
        border: '1px solid var(--border)',
        borderBottom: 'none',
        marginTop: '16px'
    },

    '.cm-code-lang': {
        fontSize: '0.8em',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        textTransform: 'lowercase'
    },

    '.cm-code-copy': {
        padding: '4px 12px',
        fontSize: '0.75em',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        backgroundColor: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'var(--font-ui)'
    },

    '.cm-code-copy:hover': {
        color: 'var(--text-primary)',
        borderColor: 'var(--accent)',
        backgroundColor: 'var(--bg-primary)'
    },

    '.cm-line:has(.cm-code-header) + .cm-line': {
        marginTop: '-1.7em'
    },

    '.cm-code-block': {
        display: 'block',
        backgroundColor: 'var(--bg-secondary)',
        padding: '2px 16px',
        borderLeft: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9em',
        lineHeight: '1.6'
    },

    '.cm-code-block-first': {
        paddingTop: '16px'
    },

    '.cm-code-block-last': {
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)',
        borderRadius: '0 0 6px 6px',
        marginBottom: '16px'
    },

    '.cm-inline-code': {
        backgroundColor: 'rgba(175, 184, 193, 0.2)',
        padding: '3px 6px',
        borderRadius: '6px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85em',
        color: 'var(--text-primary)',
        border: '1px solid rgba(175, 184, 193, 0.3)'
    },

    '.cm-strong': {
        fontWeight: '600',
        color: 'var(--text-primary)'
    },

    '.cm-emphasis': {
        fontStyle: 'italic',
        color: 'var(--text-primary)'
    },

    '.cm-link': {
        color: 'var(--accent)',
        textDecoration: 'none',
        cursor: 'pointer'
    },

    '.cm-link:hover': {
        textDecoration: 'underline'
    },

    '.cm-math-inline': {
        display: 'inline-block',
        verticalAlign: 'middle',
        color: 'var(--text-primary)'
    },

    '.cm-math-block': {
        display: 'block',
        textAlign: 'center',
        padding: '2px 0',
        margin: '2px 0',
        color: 'var(--text-primary)'
    },

    '.cm-math-error': {
        color: '#cf222e',
        backgroundColor: 'rgba(207, 34, 46, 0.1)',
        padding: '4px 8px',
        borderRadius: '6px',
        fontFamily: 'var(--font-mono)',
        border: '1px solid rgba(207, 34, 46, 0.3)'
    },

    '.cm-scroller::-webkit-scrollbar': {
        width: '10px',
        height: '10px'
    },

    '.cm-scroller::-webkit-scrollbar-track': {
        background: 'transparent'
    },

    '.cm-scroller::-webkit-scrollbar-thumb': {
        background: 'var(--text-tertiary)',
        borderRadius: '5px'
    },

    '.cm-scroller::-webkit-scrollbar-thumb:hover': {
        background: 'var(--text-secondary)'
    }
});

export const topazDarkTheme = EditorView.theme({
    '.cm-selectionBackground': {
        backgroundColor: 'rgba(74, 158, 255, 0.3)'
    },

    '&.cm-focused .cm-selectionBackground': {
        backgroundColor: 'rgba(74, 158, 255, 0.3)'
    },

    '.cm-inline-code': {
        backgroundColor: 'rgba(110, 118, 129, 0.4)',
        border: '1px solid rgba(110, 118, 129, 0.5)'
    }
}, { dark: true });