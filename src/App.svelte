<script>
  import { onMount } from 'svelte';
  import Editor from './lib/Editor.svelte';
  import Preview from './lib/Preview.svelte';
  import { THEMES, DEFAULT_THEME, applyTheme } from './lib/themes.js';
  import {
    initNative, launchFilePath, readTextFile, writeTextFile,
    pickOpenPath, pickSavePath, saveSetting, loadSetting, setWindowTitle,
  } from './lib/neu.js';

  const WELCOME = `# Welcome to markm

A fast, native markdown viewer with an **edit mode** and lots of themes.

## Try it

- Toggle **View / Edit / Split** in the toolbar
- Switch the **theme** on the right — everything restyles live
- Open a file with **Open** (or \`xdg-open file.md\` once installed)

\`\`\`js
// code blocks are highlighted too
const hello = (who) => \`hi, \${who}\`;
\`\`\`

> Edit this text, then hit **Ctrl+S** to save.

| Shortcut | Action |
|----------|--------|
| Ctrl+E   | Toggle edit |
| Ctrl+S   | Save   |
| Ctrl+O   | Open   |
`;

  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;

  let content = $state(WELCOME);
  let mode = $state('view'); // 'view' | 'edit' | 'split'
  let themeId = $state(DEFAULT_THEME);
  let filePath = $state(null);
  let dirty = $state(false);
  let zoom = $state(1);

  let fileName = $derived(filePath ? filePath.split('/').pop() : 'untitled.md');

  // Keep the OS window title in sync with the open file + dirty state.
  $effect(() => {
    setWindowTitle(`${dirty ? '● ' : ''}${fileName} — markm`);
  });

  onMount(async () => {
    initNative();

    // Restore all persisted preferences (theme, view mode, zoom/font size).
    const savedTheme = await loadSetting('theme');
    if (savedTheme) themeId = savedTheme;
    applyTheme(themeId);

    const savedMode = await loadSetting('mode');
    if (savedMode) mode = savedMode;

    const savedZoom = parseFloat(await loadSetting('zoom'));
    applyZoom(Number.isFinite(savedZoom) ? savedZoom : 1);

    // If launched with a file (xdg-open / file manager / CLI arg), open it.
    const launch = launchFilePath();
    if (launch) await openPath(launch);
  });

  // Zoom scales the whole UI (chrome + editor + preview). We use transform:
  // scale() with an inverse width/height rather than the CSS `zoom` property,
  // because WebKitGTK (unlike Blink) doesn't support `zoom` — so the mount node
  // is laid out at 1/z of the viewport and scaled back up to fill it, which
  // makes text reflow correctly at the zoomed size. Persisted like the rest.
  function applyZoom(z) {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 10) / 10));
    const el = document.getElementById('app');
    if (el) {
      el.style.transformOrigin = '0 0';
      el.style.transform = `scale(${zoom})`;
      el.style.width = `${100 / zoom}%`;
      el.style.height = `${100 / zoom}vh`;
    }
    saveSetting('zoom', String(zoom));
  }

  function changeTheme(id) {
    themeId = applyTheme(id);
    saveSetting('theme', themeId);
  }

  function setMode(m) {
    mode = m;
    saveSetting('mode', m);
  }

  async function openPath(path) {
    const text = await readTextFile(path);
    if (text === null) return;
    content = text;
    filePath = path;
    dirty = false;
  }

  async function openFile() {
    const path = await pickOpenPath();
    if (path) await openPath(path);
  }

  async function save() {
    let path = filePath;
    if (!path) {
      path = await pickSavePath(fileName);
      if (!path) return;
    }
    const ok = await writeTextFile(path, content);
    if (ok) {
      filePath = path;
      dirty = false;
    }
  }

  function onEditorChange(v) {
    content = v;
    dirty = true;
  }

  function onKey(e) {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (e.key === 's') { e.preventDefault(); save(); }
    else if (e.key === 'o') { e.preventDefault(); openFile(); }
    else if (e.key === 'e') { e.preventDefault(); setMode(mode === 'edit' ? 'view' : 'edit'); }
    // Ctrl/Cmd +/-/0 zoom. '=' is the unshifted '+' key; handle both.
    else if (e.key === '=' || e.key === '+') { e.preventDefault(); applyZoom(zoom + 0.1); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); applyZoom(zoom - 0.1); }
    else if (e.key === '0') { e.preventDefault(); applyZoom(1); }
  }
</script>

<svelte:window on:keydown={onKey} />

<div class="app">
  <header class="toolbar">
    <div class="file">
      <span class="dot" class:dirty></span>
      <span class="name" title={filePath || ''}>{fileName}</span>
    </div>

    <div class="modes" role="group" aria-label="View mode">
      <button class:active={mode === 'view'} onclick={() => setMode('view')}>View</button>
      <button class:active={mode === 'edit'} onclick={() => setMode('edit')}>Edit</button>
      <button class:active={mode === 'split'} onclick={() => setMode('split')}>Split</button>
    </div>

    <div class="actions">
      <div class="zoom" role="group" aria-label="Zoom">
        <button aria-label="Zoom out" onclick={() => applyZoom(zoom - 0.1)}>−</button>
        <button class="zoom-level" title="Reset zoom" onclick={() => applyZoom(1)}>{Math.round(zoom * 100)}%</button>
        <button aria-label="Zoom in" onclick={() => applyZoom(zoom + 0.1)}>+</button>
      </div>
      <select
        aria-label="Theme"
        value={themeId}
        onchange={(e) => changeTheme(e.currentTarget.value)}
      >
        {#each THEMES as t (t.id)}
          <option value={t.id}>{t.name}</option>
        {/each}
      </select>
      <button onclick={openFile}>Open</button>
      <button class="primary" onclick={save}>Save</button>
    </div>
  </header>

  <main class="body" class:split={mode === 'split'}>
    {#if mode === 'edit' || mode === 'split'}
      <section class="pane editor-pane">
        <Editor value={content} onChange={onEditorChange} />
      </section>
    {/if}
    {#if mode === 'view' || mode === 'split'}
      <section class="pane preview-pane">
        <Preview source={content} />
      </section>
    {/if}
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg);
    color: var(--fg);
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 3px 10px;
    background: var(--panel);
    color: var(--panel-fg);
    border-bottom: 1px solid var(--border);
    user-select: none;
    flex: none;
  }

  .file {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  .file .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid var(--muted);
    flex: none;
  }
  .dot.dirty {
    background: var(--accent);
    border-color: var(--accent);
  }

  .modes button.active {
    background: var(--accent);
    color: var(--accent-fg);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: flex-end;
  }

  /* All toolbar controls share one height so buttons and the native select
     line up exactly. */
  button,
  select {
    font: inherit;
    font-size: 12px;
    height: 26px;
    box-sizing: border-box;
    padding: 0 10px;
    line-height: normal;
    background: var(--bg);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
  }

  .modes,
  .zoom {
    display: flex;
    align-items: stretch;
    height: 26px;
    box-sizing: border-box;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }
  .modes button,
  .zoom button {
    height: 100%;
    border: none;
    border-radius: 0;
  }
  .modes button {
    border-right: 1px solid var(--border);
    padding: 0 12px;
  }
  .modes button:last-child { border-right: none; }
  .zoom button { padding: 0 10px; }
  .zoom .zoom-level {
    min-width: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
    font-variant-numeric: tabular-nums;
  }
  button:hover,
  select:hover { border-color: var(--accent); }
  button.primary {
    background: var(--accent);
    color: var(--accent-fg);
    border-color: var(--accent);
  }

  .body {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr;
  }
  .body.split {
    grid-template-columns: 1fr 1fr;
  }
  .pane {
    min-width: 0;
    height: 100%;
    overflow: hidden;
  }
  .editor-pane {
    border-right: 1px solid var(--border);
  }
  .body:not(.split) .editor-pane {
    border-right: none;
  }
</style>
