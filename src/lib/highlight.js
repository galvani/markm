// Syntax highlighting for fenced code blocks in the preview.
//
// highlight.js core + an explicit language list, NOT the `highlight.js` barrel:
// the barrel pulls in ~190 grammars (megabytes) and this app only needs the
// languages people actually write in a README. Add a language by importing it
// and listing it below.
//
// Colors are NOT taken from an hljs stylesheet — they map onto the app's own
// theme vars (see app.css), so every theme highlights coherently and a new
// theme needs no syntax palette of its own.
import hljs from 'highlight.js/lib/core';

import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import go from 'highlight.js/lib/languages/go';
import ini from 'highlight.js/lib/languages/ini';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import php from 'highlight.js/lib/languages/php';
import phpTemplate from 'highlight.js/lib/languages/php-template';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

for (const [name, lang] of Object.entries({
  bash,
  css,
  diff,
  dockerfile,
  go,
  ini,
  javascript,
  json,
  markdown,
  php,
  'php-template': phpTemplate, // php.js needs it for `<?php ... ?>` in HTML
  python,
  rust,
  sql,
  typescript,
  xml,
  yaml,
})) {
  hljs.registerLanguage(name, lang);
}

/**
 * Highlight `code` as `lang`, returning HTML for a `<code>` body.
 * Unknown or missing languages fall back to escaped plain text — no
 * auto-detection, which guesses wrong on short snippets more often than it helps.
 * @returns {string} highlighted HTML, or '' to let markdown-it escape it itself
 */
export function highlightCode(code, lang) {
  if (!lang || !hljs.getLanguage(lang)) return '';
  try {
    return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
  } catch {
    return '';
  }
}
