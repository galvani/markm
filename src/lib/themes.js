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
      '--syn-keyword': '#cf222e', '--syn-string': '#0a3069', '--syn-name': '#8250df', '--syn-number': '#0550ae', '--syn-comment': '#6e7781',
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
      '--syn-keyword': '#ff7b72', '--syn-string': '#a5d6ff', '--syn-name': '#d2a8ff', '--syn-number': '#79c0ff', '--syn-comment': '#8b949e',
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
      '--syn-keyword': '#ff79c6', '--syn-string': '#f1fa8c', '--syn-name': '#50fa7b', '--syn-number': '#bd93f9', '--syn-comment': '#6272a4',
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
      '--syn-keyword': '#81a1c1', '--syn-string': '#a3be8c', '--syn-name': '#88c0d0', '--syn-number': '#b48ead', '--syn-comment': '#616e88',
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
      '--syn-keyword': '#859900', '--syn-string': '#2aa198', '--syn-name': '#268bd2', '--syn-number': '#d33682', '--syn-comment': '#93a1a1',
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
      '--syn-keyword': '#fb4934', '--syn-string': '#b8bb26', '--syn-name': '#8ec07c', '--syn-number': '#d3869b', '--syn-comment': '#928374',
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
      '--syn-keyword': '#31748f', '--syn-string': '#f6c177', '--syn-name': '#ebbcba', '--syn-number': '#c4a7e7', '--syn-comment': '#6e6a86',
      '--editor-gutter': '#6e6a86', '--editor-cursor': '#c4a7e7', '--editor-active': '#1f1d2e',
    },
  },
  {
    id: 'rose-pine-dawn', name: 'Rosé Pine Dawn', dark: false,
    vars: {
      '--bg': '#faf4ed', '--fg': '#575279', '--panel': '#fffaf3', '--panel-fg': '#575279',
      '--border': '#dfdad9', '--muted': '#797593', '--accent': '#907aa9', '--accent-fg': '#faf4ed',
      '--sel': '#dfdad9', '--code-bg': '#f2e9e1', '--code-fg': '#575279', '--heading': '#b4637a',
      '--link': '#286983', '--quote-border': '#9893a5',
      '--syn-keyword': '#286983', '--syn-string': '#ea9d34', '--syn-name': '#d7827e', '--syn-number': '#907aa9', '--syn-comment': '#9893a5',
      '--editor-gutter': '#9893a5', '--editor-cursor': '#907aa9', '--editor-active': '#fffaf3',
    },
  },
  {
    id: 'catppuccin-mocha', name: 'Catppuccin Mocha', dark: true,
    vars: {
      '--bg': '#1e1e2e', '--fg': '#cdd6f4', '--panel': '#181825', '--panel-fg': '#cdd6f4',
      '--border': '#313244', '--muted': '#9399b2', '--accent': '#cba6f7', '--accent-fg': '#1e1e2e',
      '--sel': '#45475a', '--code-bg': '#181825', '--code-fg': '#cdd6f4', '--heading': '#f5c2e7',
      '--link': '#89b4fa', '--quote-border': '#6c7086',
      '--syn-keyword': '#cba6f7', '--syn-string': '#a6e3a1', '--syn-name': '#89b4fa', '--syn-number': '#fab387', '--syn-comment': '#6c7086',
      '--editor-gutter': '#6c7086', '--editor-cursor': '#f5e0dc', '--editor-active': '#181825',
    },
  },
  {
    id: 'catppuccin-latte', name: 'Catppuccin Latte', dark: false,
    vars: {
      '--bg': '#eff1f5', '--fg': '#4c4f69', '--panel': '#e6e9ef', '--panel-fg': '#4c4f69',
      '--border': '#ccd0da', '--muted': '#6c6f85', '--accent': '#8839ef', '--accent-fg': '#eff1f5',
      '--sel': '#ccd0da', '--code-bg': '#e6e9ef', '--code-fg': '#4c4f69', '--heading': '#ea76cb',
      '--link': '#1e66f5', '--quote-border': '#9ca0b0',
      '--syn-keyword': '#8839ef', '--syn-string': '#40a02b', '--syn-name': '#1e66f5', '--syn-number': '#fe640b', '--syn-comment': '#9ca0b0',
      '--editor-gutter': '#9ca0b0', '--editor-cursor': '#dc8a78', '--editor-active': '#e6e9ef',
    },
  },
  {
    id: 'tokyo-night', name: 'Tokyo Night', dark: true,
    vars: {
      '--bg': '#1a1b26', '--fg': '#c0caf5', '--panel': '#16161e', '--panel-fg': '#c0caf5',
      '--border': '#292e42', '--muted': '#787c99', '--accent': '#7aa2f7', '--accent-fg': '#1a1b26',
      '--sel': '#283457', '--code-bg': '#16161e', '--code-fg': '#c0caf5', '--heading': '#bb9af7',
      '--link': '#7dcfff', '--quote-border': '#565f89',
      '--syn-keyword': '#bb9af7', '--syn-string': '#9ece6a', '--syn-name': '#7aa2f7', '--syn-number': '#ff9e64', '--syn-comment': '#565f89',
      '--editor-gutter': '#3b4261', '--editor-cursor': '#c0caf5', '--editor-active': '#16161e',
    },
  },
  {
    id: 'one-dark', name: 'One Dark', dark: true,
    vars: {
      '--bg': '#282c34', '--fg': '#abb2bf', '--panel': '#21252b', '--panel-fg': '#abb2bf',
      '--border': '#3e4451', '--muted': '#7f848e', '--accent': '#61afef', '--accent-fg': '#282c34',
      '--sel': '#3e4451', '--code-bg': '#21252b', '--code-fg': '#abb2bf', '--heading': '#e5c07b',
      '--link': '#61afef', '--quote-border': '#5c6370',
      '--syn-keyword': '#c678dd', '--syn-string': '#98c379', '--syn-name': '#e06c75', '--syn-number': '#d19a66', '--syn-comment': '#5c6370',
      '--editor-gutter': '#5c6370', '--editor-cursor': '#528bff', '--editor-active': '#21252b',
    },
  },
  {
    id: 'everforest-dark', name: 'Everforest Dark', dark: true,
    vars: {
      '--bg': '#2d353b', '--fg': '#d3c6aa', '--panel': '#272e33', '--panel-fg': '#d3c6aa',
      '--border': '#414b50', '--muted': '#9da9a0', '--accent': '#a7c080', '--accent-fg': '#2d353b',
      '--sel': '#475258', '--code-bg': '#272e33', '--code-fg': '#d3c6aa', '--heading': '#dbbc7f',
      '--link': '#7fbbb3', '--quote-border': '#859289',
      '--syn-keyword': '#e67e80', '--syn-string': '#a7c080', '--syn-name': '#83c092', '--syn-number': '#d699b6', '--syn-comment': '#859289',
      '--editor-gutter': '#7a8478', '--editor-cursor': '#d3c6aa', '--editor-active': '#272e33',
    },
  },
  {
    id: 'gruvbox-light', name: 'Gruvbox Light', dark: false,
    vars: {
      '--bg': '#fbf1c7', '--fg': '#3c3836', '--panel': '#ebdbb2', '--panel-fg': '#3c3836',
      '--border': '#d5c4a1', '--muted': '#7c6f64', '--accent': '#af3a03', '--accent-fg': '#fbf1c7',
      '--sel': '#d5c4a1', '--code-bg': '#ebdbb2', '--code-fg': '#3c3836', '--heading': '#79740e',
      '--link': '#076678', '--quote-border': '#a89984',
      '--syn-keyword': '#9d0006', '--syn-string': '#79740e', '--syn-name': '#427b58', '--syn-number': '#8f3f71', '--syn-comment': '#928374',
      '--editor-gutter': '#a89984', '--editor-cursor': '#af3a03', '--editor-active': '#ebdbb2',
    },
  },
  {
    id: 'solarized-dark', name: 'Solarized Dark', dark: true,
    vars: {
      '--bg': '#002b36', '--fg': '#93a1a1', '--panel': '#073642', '--panel-fg': '#eee8d5',
      '--border': '#0f4553', '--muted': '#657b83', '--accent': '#268bd2', '--accent-fg': '#002b36',
      '--sel': '#0f4553', '--code-bg': '#073642', '--code-fg': '#93a1a1', '--heading': '#b58900',
      '--link': '#2aa198', '--quote-border': '#586e75',
      '--syn-keyword': '#859900', '--syn-string': '#2aa198', '--syn-name': '#268bd2', '--syn-number': '#d33682', '--syn-comment': '#586e75',
      '--editor-gutter': '#586e75', '--editor-cursor': '#268bd2', '--editor-active': '#073642',
    },
  },
  {
    id: 'monokai', name: 'Monokai', dark: true,
    vars: {
      '--bg': '#272822', '--fg': '#f8f8f2', '--panel': '#1e1f1c', '--panel-fg': '#f8f8f2',
      '--border': '#3e3d32', '--muted': '#90908a', '--accent': '#a6e22e', '--accent-fg': '#272822',
      '--sel': '#49483e', '--code-bg': '#1e1f1c', '--code-fg': '#f8f8f2', '--heading': '#66d9ef',
      '--link': '#66d9ef', '--quote-border': '#75715e',
      '--syn-keyword': '#f92672', '--syn-string': '#e6db74', '--syn-name': '#a6e22e', '--syn-number': '#ae81ff', '--syn-comment': '#75715e',
      '--editor-gutter': '#75715e', '--editor-cursor': '#f8f8f0', '--editor-active': '#1e1f1c',
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
  // Light/dark discriminator (theme.id alone doesn't say which) — CSS keys the
  // refresh-pulse's persistent tint off this.
  root.dataset.mode = theme.dark ? 'dark' : 'light';
  root.style.colorScheme = theme.dark ? 'dark' : 'light';
  return theme.id;
}
