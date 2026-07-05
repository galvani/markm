// Reading-font catalog for the rendered preview. Each entry is a font-family
// stack applied to .markdown-body via the --body-font CSS variable. Stacks list
// several concrete faces before a generic fallback so they degrade to whatever
// the box actually has installed (no bundled/webfont files — WebKitGTK only has
// the system fonts to work with).

/** @typedef {{ id: string, name: string, stack: string }} Font */

/** @type {Font[]} */
export const FONTS = [
  { id: 'system', name: 'System', stack: "system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, Cantarell, sans-serif" },
  { id: 'sans', name: 'Sans', stack: "Inter, 'Noto Sans', Roboto, Ubuntu, 'DejaVu Sans', sans-serif" },
  { id: 'serif', name: 'Serif', stack: "Charter, Georgia, 'Noto Serif', 'DejaVu Serif', 'Times New Roman', serif" },
  { id: 'mono', name: 'Mono', stack: "ui-monospace, 'JetBrains Mono', 'Cascadia Code', 'DejaVu Sans Mono', Menlo, monospace" },
];

export const DEFAULT_FONT = 'system';

/** Look up a font by id, falling back to the default. */
export function getFont(id) {
  return FONTS.find((f) => f.id === id) || FONTS.find((f) => f.id === DEFAULT_FONT);
}

/** Apply a reading font to the preview by setting --body-font on <html>. */
export function applyFont(id) {
  const font = getFont(id);
  document.documentElement.style.setProperty('--body-font', font.stack);
  return font.id;
}
