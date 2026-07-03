// CodeMirror 6 setup for the markdown source pane.
//
// The theme and syntax highlighting are expressed entirely with `var(--...)`
// CSS custom properties, so switching the app theme (which rewrites those
// variables on <html>) restyles the editor live — no EditorView reconfigure.

import { EditorView, keymap, highlightActiveLine, drawSelection, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// Markdown token colors, all driven by theme CSS variables.
const highlight = HighlightStyle.define([
  { tag: t.heading, color: 'var(--heading)', fontWeight: '600' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: [t.link, t.url], color: 'var(--link)' },
  { tag: t.monospace, color: 'var(--code-fg)' },
  { tag: [t.quote], color: 'var(--muted)', fontStyle: 'italic' },
  { tag: [t.list, t.processingInstruction], color: 'var(--accent)' },
  { tag: [t.meta, t.comment], color: 'var(--muted)' },
]);

const theme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'transparent', color: 'var(--fg)' },
  '.cm-scroller': { fontFamily: 'var(--mono)', fontSize: '14px', lineHeight: '1.6' },
  '.cm-content': { caretColor: 'var(--editor-cursor)', padding: '12px 4px' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--editor-cursor)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--sel)',
  },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--editor-gutter)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'var(--editor-active)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--editor-active)', color: 'var(--fg)' },
  '.cm-selectionMatch': { backgroundColor: 'var(--sel)' },
});

/**
 * Create a CodeMirror editor.
 * @param {HTMLElement} parent
 * @param {{ doc?: string, onChange?: (value: string) => void }} opts
 * @returns {EditorView}
 */
export function createEditor(parent, { doc = '', onChange } = {}) {
  const listener = EditorView.updateListener.of((u) => {
    if (u.docChanged && onChange) onChange(u.state.doc.toString());
  });

  const state = EditorState.create({
    doc,
    extensions: [
      lineNumbers(),
      history(),
      drawSelection(),
      highlightActiveLine(),
      EditorView.lineWrapping,
      markdown({ base: markdownLanguage, codeLanguages: [] }),
      syntaxHighlighting(highlight),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      theme,
      listener,
    ],
  });

  return new EditorView({ state, parent });
}

/** Replace the editor's whole document (e.g. when a new file is loaded). */
export function setEditorDoc(view, text) {
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: text },
  });
}
