<script>
  import MarkdownIt from 'markdown-it';
  import { onMount } from 'svelte';
  import { saveSetting, loadSetting, copyToClipboard, readImageDataUrl } from './neu.js';
  import { highlightCode } from './highlight.js';

  // pulseTick bumps (from App) only on an on-disk auto-refresh; when it changes
  // we flash whichever rendered blocks are new vs the previous render.
  // scrollKey = the open file's path; scroll position is remembered per key.
  // basePath = the open file's path; relative image srcs resolve against its dir.
  let { source = '', onLink, pulseTick = 0, scrollKey = '', basePath = '' } = $props();

  // html:false keeps raw embedded HTML inert — a viewer opening arbitrary
  // files shouldn't execute markup it was handed. linkify/typographer add the
  // niceties people expect from a modern renderer.
  const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

  // Fenced blocks render as: wrapper > (language tag + copy button) + <pre><code>.
  // The wrapper is what the copy button anchors to, and it stays a single
  // top-level child of .markdown-body so the pulse logic below still sees one
  // block per fence.
  md.renderer.rules.fence = (tokens, idx) => {
    const { info, content } = tokens[idx];
    const lang = (info || '').trim().split(/\s+/)[0].toLowerCase();
    const body = highlightCode(content, lang) || md.utils.escapeHtml(content);
    const tag = lang ? md.utils.escapeHtml(lang) : '';
    return (
      `<div class="code-block">` +
      `<div class="code-bar">${tag ? `<span class="code-lang">${tag}</span>` : ''}` +
      `<button class="code-copy" type="button" aria-label="Copy code">Copy</button></div>` +
      `<pre><code class="hljs${tag ? ` language-${tag}` : ''}">${body}</code></pre>` +
      `</div>\n`
    );
  };

  // Local images are rendered with the resolved absolute path parked in
  // `data-local-src` and no `src` at all: the bytes have to be inlined
  // asynchronously (see loadImages), and emitting a real src first would just
  // produce a broken-image icon before the swap.
  const defaultImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const src = token.attrGet('src') || '';
    if (!/^[a-z][a-z0-9+.-]*:|^\/\//i.test(src)) {
      const abs = resolvePath(src);
      if (abs) {
        token.attrSet('data-local-src', abs);
        token.attrSet('src', '');
      }
    }
    return defaultImage(tokens, idx, options, env, self);
  };

  // Resolve a relative markdown src against the open file's directory.
  function resolvePath(src) {
    if (!src) return null;
    if (src.startsWith('/')) return src;
    if (!basePath) return null;
    const dir = basePath.slice(0, basePath.lastIndexOf('/'));
    const out = [];
    for (const seg of `${dir}/${decodeURI(src)}`.split('/')) {
      if (seg === '' || seg === '.') continue;
      if (seg === '..') out.pop();
      else out.push(seg);
    }
    return '/' + out.join('/');
  }

  let html = $derived(md.render(source || ''));

  let el; // the preview pane element

  // Inline every local image's bytes as a data: URI after each render. Cached by
  // path so a re-render (typing in Split mode, auto-refresh) doesn't re-read the
  // file for images that are already loaded.
  const imageCache = new Map();
  async function loadImages() {
    if (!el) return;
    for (const img of el.querySelectorAll('img[data-local-src]')) {
      const path = img.dataset.localSrc;
      if (!imageCache.has(path)) imageCache.set(path, readImageDataUrl(path));
      const url = await imageCache.get(path);
      if (url && img.dataset.localSrc === path) img.src = url;
    }
  }
  $effect(() => {
    html; // re-run whenever the rendered output changes
    loadImages();
  });

  // Reading-font auto-scale. Rather than cap the window width, we keep the line
  // length readable by GROWING the font once the pane is wider than BASE_PANE
  // (so a wide/fullscreen window shows bigger text, ~constant chars-per-line).
  // Below BASE_PANE the font stays at BASE_FONT. Measuring the pane's own width
  // (not the viewport) makes this correct in split mode and with the sidebar open.
  //
  // Gotcha: measure the pane's ON-SCREEN width, not its layout width. Zoom lays
  // the surface out at 1/z of the pane and scales it back up, so layout px grow
  // as you zoom OUT — feeding those in grows the font by exactly the factor zoom
  // shrinks it, and zoom becomes a no-op for the preview. The rect/offset ratio
  // recovers the ancestor scale, so the font is fitted to what the eye sees.
  const BASE_FONT = 17; // px at/under BASE_PANE
  const BASE_PANE = 932; // px pane width giving the intended measure (~820px text)
  const MAX_FONT = 40; // px ceiling so extreme widths don't produce silly text
  function fitFont() {
    if (!el) return;
    const scale = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
    const visibleWidth = el.clientWidth * scale;
    const size = Math.min(MAX_FONT, Math.max(BASE_FONT, (BASE_FONT * visibleWidth) / BASE_PANE));
    // Set the fitted size as-is: it is a layout value inside the surface, so the
    // zoom transform then scales it — 17px fitted at 50% zoom reads as 8.5px.
    el.style.setProperty('--reading-font', `${size.toFixed(1)}px`);
  }

  onMount(() => {
    fitFont();
    const ro = new ResizeObserver(fitFont);
    ro.observe(el);
    el.addEventListener('click', handleClick);
    return () => {
      ro.disconnect();
      el.removeEventListener('click', handleClick);
    };
  });

  // Pulse changed blocks on refresh. Runs after each render (depends on `html`),
  // but only flashes when `pulseTick` has advanced — so live typing in Split mode
  // never pulses, only an on-disk auto-refresh does. A block is "new" when its
  // trimmed text isn't among the previous render's block texts.
  let prevBlockText = new Set();
  let lastPulseTick = -1;
  $effect(() => {
    html; // re-run when the rendered output changes
    const tick = pulseTick;
    if (!el) return;
    const doPulse = lastPulseTick !== -1 && tick !== lastPulseTick;
    const next = new Set();
    for (const block of el.children) {
      const t = block.textContent.trim();
      if (t) next.add(t);
      if (doPulse && t && !prevBlockText.has(t)) {
        block.classList.remove('pulse-new'); // restart the animation if re-hit
        void block.offsetWidth; // force reflow so the re-added class re-triggers
        block.classList.add('pulse-new');
      }
    }
    prevBlockText = next;
    lastPulseTick = tick;
  });

  // --- Per-file scroll memory ---
  // Store position as a RATIO (0..1) rather than px so it survives reflow from a
  // different window width / reading-font. Restore only when the file changes
  // (tracked via restoredKey), so typing/auto-refresh in the same file doesn't
  // yank the view back.
  let restoredKey = null;
  let scrollTimer;
  function saveScroll() {
    if (!el || !scrollKey) return;
    const room = el.scrollHeight - el.clientHeight;
    saveSetting(`scroll:${scrollKey}`, String(room > 0 ? el.scrollTop / room : 0));
  }
  function onScroll() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(saveScroll, 200); // debounce persistence
  }
  async function restoreScroll(key) {
    const ratio = parseFloat(await loadSetting(`scroll:${key}`));
    if (!el || key !== scrollKey || !Number.isFinite(ratio)) return;
    // Two rAFs: let the render + reading-font layout settle before measuring.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (key === scrollKey) el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
      }),
    );
  }
  $effect(() => {
    html; // re-run once the new file's content is rendered
    const key = scrollKey;
    if (key && key !== restoredKey) {
      restoredKey = key;
      restoreScroll(key);
    }
  });

  // Delegate anchor clicks up to the app: a bare <a> would navigate the webview
  // itself (blanking the app), so we always preventDefault and let App route the
  // href — external links to the browser, local .md files back into the viewer.
  function handleClick(e) {
    const copy = e.target.closest?.('.code-copy');
    if (copy) {
      copyBlock(copy);
      return;
    }
    const a = e.target.closest?.('a');
    if (!a) return;
    e.preventDefault();
    onLink?.(a.getAttribute('href'));
  }

  // Copy the fence's source text (textContent, so the hljs markup doesn't come
  // along) and confirm on the button itself — a toast would be overkill here.
  async function copyBlock(btn) {
    const code = btn.closest('.code-block')?.querySelector('code');
    if (!code) return;
    const ok = await copyToClipboard(code.textContent);
    btn.textContent = ok ? 'Copied' : 'Failed';
    btn.classList.add('done');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('done');
    }, 1200);
  }
</script>

<div class="preview markdown-body" bind:this={el} onscroll={onScroll}>
  {@html html}
</div>

<style>
  .preview {
    height: 100%;
    overflow: auto;
    padding: 44px 56px;
    box-sizing: border-box;
  }

  /* Newly-changed blocks after an auto-refresh wash with the insertion tint
     (same green as the diff view) so the eye lands on what changed, then settle
     into a subtle persistent tint that stays until the next change. */
  .preview :global(.pulse-new) {
    animation: pulse-new 3.2s ease-out forwards;
    border-radius: 4px;
    margin-inline: -8px; /* extend the tint sideways without shifting text */
    padding-inline: 8px;
  }
  @keyframes pulse-new {
    0%,
    22% {
      background-color: var(--diff-ins-bg);
    }
    100% {
      background-color: var(--pulse-persist-bg);
    }
  }
</style>
