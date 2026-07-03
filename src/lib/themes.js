// Theme catalog. Each theme is a flat set of CSS custom properties applied to
// <html>. The app chrome, the rendered markdown preview, AND the CodeMirror
// editor all read these same tokens (CodeMirror's theme uses `var(--...)`
// strings), so a single switch restyles everything coherently.

/** @typedef {{ id: string, name: string, dark: boolean, vars: Record<string,string> }} Theme */

/** @type {Theme[]} */
export const THEMES = [
  {
    id: 'light', name: 'Light', dark: false,
    vars: {
      '--bg': '#ffffff', '--fg': '#24292f', '--panel': '#f6f8fa', '--panel-fg': '#24292f',
      '--border': '#d0d7de', '--muted': '#57606a', '--accent': '#0969da', '--accent-fg': '#ffffff',
      '--sel': '#b6d8fe', '--code-bg': '#eff1f3', '--code-fg': '#24292f', '--heading': '#1f2328',
      '--link': '#0969da', '--quote-border': '#d0d7de',
      '--editor-gutter': '#6e7781', '--editor-cursor': '#0969da', '--editor-active': '#f6f8fa',
    },
  },
  {
    id: 'dark', name: 'Dark', dark: true,
    vars: {
      '--bg': '#0d1117', '--fg': '#e6edf3', '--panel': '#161b22', '--panel-fg': '#e6edf3',
      '--border': '#30363d', '--muted': '#8b949e', '--accent': '#2f81f7', '--accent-fg': '#ffffff',
      '--sel': '#264f78', '--code-bg': '#161b22', '--code-fg': '#e6edf3', '--heading': '#f0f6fc',
      '--link': '#2f81f7', '--quote-border': '#30363d',
      '--editor-gutter': '#6e7681', '--editor-cursor': '#58a6ff', '--editor-active': '#161b22',
    },
  },
  {
    id: 'dracula', name: 'Dracula', dark: true,
    vars: {
      '--bg': '#282a36', '--fg': '#f8f8f2', '--panel': '#21222c', '--panel-fg': '#f8f8f2',
      '--border': '#44475a', '--muted': '#6272a4', '--accent': '#bd93f9', '--accent-fg': '#282a36',
      '--sel': '#44475a', '--code-bg': '#21222c', '--code-fg': '#f8f8f2', '--heading': '#ff79c6',
      '--link': '#8be9fd', '--quote-border': '#6272a4',
      '--editor-gutter': '#6272a4', '--editor-cursor': '#f8f8f2', '--editor-active': '#21222c',
    },
  },
  {
    id: 'nord', name: 'Nord', dark: true,
    vars: {
      '--bg': '#2e3440', '--fg': '#d8dee9', '--panel': '#3b4252', '--panel-fg': '#eceff4',
      '--border': '#434c5e', '--muted': '#7b88a1', '--accent': '#88c0d0', '--accent-fg': '#2e3440',
      '--sel': '#434c5e', '--code-bg': '#3b4252', '--code-fg': '#e5e9f0', '--heading': '#8fbcbb',
      '--link': '#88c0d0', '--quote-border': '#4c566a',
      '--editor-gutter': '#4c566a', '--editor-cursor': '#88c0d0', '--editor-active': '#3b4252',
    },
  },
  {
    id: 'solarized-light', name: 'Solarized Light', dark: false,
    vars: {
      '--bg': '#fdf6e3', '--fg': '#657b83', '--panel': '#eee8d5', '--panel-fg': '#586e75',
      '--border': '#d9d2c0', '--muted': '#93a1a1', '--accent': '#268bd2', '--accent-fg': '#fdf6e3',
      '--sel': '#e6dfc5', '--code-bg': '#eee8d5', '--code-fg': '#586e75', '--heading': '#b58900',
      '--link': '#268bd2', '--quote-border': '#93a1a1',
      '--editor-gutter': '#93a1a1', '--editor-cursor': '#268bd2', '--editor-active': '#eee8d5',
    },
  },
  {
    id: 'gruvbox-dark', name: 'Gruvbox Dark', dark: true,
    vars: {
      '--bg': '#282828', '--fg': '#ebdbb2', '--panel': '#3c3836', '--panel-fg': '#ebdbb2',
      '--border': '#504945', '--muted': '#a89984', '--accent': '#fabd2f', '--accent-fg': '#282828',
      '--sel': '#504945', '--code-bg': '#3c3836', '--code-fg': '#ebdbb2', '--heading': '#b8bb26',
      '--link': '#83a598', '--quote-border': '#a89984',
      '--editor-gutter': '#7c6f64', '--editor-cursor': '#fe8019', '--editor-active': '#3c3836',
    },
  },
  {
    id: 'rose-pine', name: 'Rosé Pine', dark: true,
    vars: {
      '--bg': '#191724', '--fg': '#e0def4', '--panel': '#1f1d2e', '--panel-fg': '#e0def4',
      '--border': '#26233a', '--muted': '#6e6a86', '--accent': '#c4a7e7', '--accent-fg': '#191724',
      '--sel': '#403d52', '--code-bg': '#1f1d2e', '--code-fg': '#e0def4', '--heading': '#ebbcba',
      '--link': '#9ccfd8', '--quote-border': '#6e6a86',
      '--editor-gutter': '#6e6a86', '--editor-cursor': '#c4a7e7', '--editor-active': '#1f1d2e',
    },
  },
];

export const DEFAULT_THEME = 'dark';

/** Look up a theme by id, falling back to the default. */
export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES.find((t) => t.id === DEFAULT_THEME);
}

/** Apply a theme's CSS variables to <html> and record light/dark for scrollbars etc. */
export function applyTheme(id) {
  const theme = getTheme(id);
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme.vars)) root.style.setProperty(k, v);
  root.dataset.theme = theme.id;
  root.style.colorScheme = theme.dark ? 'dark' : 'light';
  return theme.id;
}
