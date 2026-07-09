<script>
  import { onMount, onDestroy } from 'svelte';
  import Editor from './lib/Editor.svelte';
  import Preview from './lib/Preview.svelte';
  import Sidebar from './lib/Sidebar.svelte';
  import DiffView from './lib/DiffView.svelte';
  import Chooser from './lib/Chooser.svelte';
  import { THEMES, DEFAULT_THEME, applyTheme } from './lib/themes.js';
  import { FONTS, DEFAULT_FONT, applyFont } from './lib/fonts.js';
  import {
    initNative, launchFilePath, readTextFile, writeTextFile,
    pickOpenPath, pickSavePath, saveSetting, loadSetting, setWindowTitle,
    pickFolderPath, listMarkdownFiles, revealInFileManager,
    gitIsTracked, gitHeadContent, watchFile, exitApp,
    pathStat, listMarkdownFilesWithStats, openExternal,
  } from './lib/neu.js';

  const MD_RE = /\.(md|markdown|mdown|mkd|mkdn)$/i;

  const WELCOME = `# Welcome to markm

A fast, native markdown viewer with an **edit mode** and lots of themes.

## Try it

- Toggle **View / Edit / Split** in the toolbar
- Switch the **theme** and **reading font** on the right — everything restyles live
- Open a file with **Open**, or a whole folder with **Folder** (or \`xdg-open file.md\` / \`markm .\` once installed)
- Links are clickable — external ones open in your browser, local \`.md\` files open here

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
| Ctrl +/− | Zoom in / out |
| Ctrl+0   | Reset zoom |
| Esc      | Close markm (in View mode) |
`;

  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;

  let content = $state(WELCOME);
  let mode = $state('view'); // 'view' | 'edit' | 'split'
  let themeId = $state(DEFAULT_THEME);
  let fontId = $state(DEFAULT_FONT);
  let filePath = $state(null);
  let dirty = $state(false);
  let reloaded = $state(false); // brief "updated" badge after an on-disk auto-refresh
  let refreshTick = $state(0); // bumped only on an external reload → Preview pulses changed blocks
  let zoom = $state(1);
  let folderPath = $state(null);
  let folderFiles = $state([]);
  let sidebarOpen = $state(false);
  let gitTracked = $state(false);
  let previousContent = $state(null); // file content at HEAD (for the diff view)
  let chooserOpen = $state(false); // directory-launch markdown picker
  let chooserDir = $state('');
  let chooserFiles = $state([]);

  let fileName = $derived(filePath ? filePath.split('/').pop() : 'untitled.md');
  let folderName = $derived(folderPath ? folderPath.split('/').pop() : '');

  // Active file-watcher cleanup + the pulse-reset timer (plain vars, not state).
  let disposeWatcher = null;
  let reloadTimer = null;

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

    const savedFont = await loadSetting('font');
    if (savedFont) fontId = savedFont;
    applyFont(fontId);

    const savedMode = await loadSetting('mode');
    if (savedMode) mode = savedMode;

    const savedZoom = parseFloat(await loadSetting('zoom'));
    applyZoom(Number.isFinite(savedZoom) ? savedZoom : 1);

    // Restore the folder + sidebar. The sidebar stays hidden on startup unless
    // it was open last session ("unless previously").
    const savedFolder = await loadSetting('folder');
    if (savedFolder) {
      folderPath = savedFolder;
      folderFiles = await listMarkdownFiles(savedFolder);
    }
    sidebarOpen = (await loadSetting('sidebarOpen')) === '1' && !!folderPath;

    // If launched with a path (xdg-open / file manager / CLI arg): a directory
    // (e.g. `markm .` or `markm /tmp`) opens the picker; a file opens directly.
    const launch = launchFilePath();
    if (launch) {
      const st = await pathStat(launch);
      if (st?.isDirectory) await openChooser(launch);
      else await openPath(launch);
    }
  });

  // Show the markdown picker for a directory. Also primes the folder sidebar so
  // switching files stays available after a pick.
  async function openChooser(dir) {
    chooserDir = dir;
    chooserFiles = await listMarkdownFilesWithStats(dir);
    folderPath = dir;
    folderFiles = await listMarkdownFiles(dir);
    chooserOpen = true;
  }

  async function pickFromChooser(path) {
    chooserOpen = false;
    await openPath(path);
  }

  onDestroy(() => {
    if (reloadTimer) clearTimeout(reloadTimer);
    if (disposeWatcher) disposeWatcher();
  });

  async function openFolder() {
    const dir = await pickFolderPath();
    if (!dir) return;
    folderPath = dir;
    folderFiles = await listMarkdownFiles(dir);
    setSidebar(true);
    saveSetting('folder', dir);
  }

  function setSidebar(open) {
    sidebarOpen = open;
    saveSetting('sidebarOpen', open ? '1' : '0');
  }

  function toggleSidebar() {
    setSidebar(!sidebarOpen);
  }

  function revealCurrent() {
    revealInFileManager(filePath);
  }

  // Zoom scales the document workspace, not the toolbar. We use transform:
  // scale() with an inverse width/height rather than the CSS `zoom` property,
  // because WebKitGTK (unlike Blink) doesn't support `zoom` — so the workspace
  // surface is laid out at 1/z of its pane and scaled back up to fill it, which
  // makes content reflow correctly at the zoomed size. Persisted like the rest.
  function applyZoom(z) {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 10) / 10));
    const el = document.getElementById('zoom-surface');
    if (el) {
      if (zoom === 1) {
        // No transform at 100% — a transformed ancestor breaks CodeMirror's
        // coordinate measurement (selection), so keep the common case clean.
        el.style.transform = 'none';
        el.style.width = '100%';
        el.style.height = '100%';
      } else {
        el.style.transformOrigin = '0 0';
        el.style.transform = `scale(${zoom})`;
        el.style.width = `${100 / zoom}%`;
        el.style.height = `${100 / zoom}%`;
      }
    }
    saveSetting('zoom', String(zoom));
  }

  function changeTheme(id) {
    themeId = applyTheme(id);
    saveSetting('theme', themeId);
  }

  function changeFont(id) {
    fontId = applyFont(id);
    saveSetting('font', fontId);
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
    await refreshGit();
    await armWatcher(path);
  }

  // (Re)install the on-disk watcher for the open file. Tears down any previous
  // watcher first so we only ever track the currently-open file.
  async function armWatcher(path) {
    if (disposeWatcher) { await disposeWatcher(); disposeWatcher = null; }
    disposeWatcher = await watchFile(path, () => reloadFromDisk(path));
  }

  // React to an external change to the open file. We never clobber unsaved
  // edits: if the buffer is dirty we leave it alone. Otherwise reload — but only
  // pulse when the bytes actually changed, so our own saves stay silent.
  async function reloadFromDisk(path) {
    if (path !== filePath || dirty) return;
    const text = await readTextFile(path);
    if (text === null || text === content) return;
    content = text;
    await refreshGit();
    refreshTick++; // tells Preview to pulse whatever blocks changed
    flashReloaded();
  }

  function flashReloaded() {
    reloaded = true;
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => { reloaded = false; }, 1100);
  }

  // Refresh whether the open file is git-tracked (drives the "Changes" mode).
  async function refreshGit() {
    gitTracked = await gitIsTracked(filePath);
    if (!gitTracked && mode === 'diff') mode = 'view';
    else if (gitTracked && mode === 'diff') previousContent = await gitHeadContent(filePath);
  }

  // Enter the diff view, fetching the latest HEAD version. 'diff' is a transient
  // mode — not persisted as a startup mode (startup needs a loaded, tracked file).
  async function enterDiff() {
    previousContent = await gitHeadContent(filePath);
    mode = 'diff';
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

  // Route a clicked preview link. External URLs go to the system browser;
  // in-page anchors scroll; local markdown opens in the viewer; anything else
  // local is handed to the OS default handler.
  async function onLink(href) {
    if (!href) return;
    if (/^(https?:|mailto:|tel:)/i.test(href)) { openExternal(href); return; }
    if (href.startsWith('#')) {
      const el = document.getElementById(decodeURIComponent(href.slice(1)));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const abs = resolveLocal(href);
    const st = await pathStat(abs);
    if (st?.isDirectory) { await openChooser(abs); return; }
    if (MD_RE.test(abs)) { await openPath(abs); return; }
    openExternal(abs); // images, PDFs, etc.
  }

  // Resolve a link target (possibly relative / file://) against the open file's
  // directory into an absolute, normalised path.
  function resolveLocal(href) {
    let p = href;
    try { p = decodeURI(href); } catch { /* leave as-is */ }
    if (p.startsWith('file://')) p = p.slice(7);
    p = p.split(/[?#]/)[0]; // drop any query/fragment
    if (p.startsWith('/')) return normalizePath(p);
    const baseDir = filePath ? filePath.slice(0, filePath.lastIndexOf('/')) : (folderPath || '');
    return normalizePath(`${baseDir}/${p}`);
  }

  // Collapse '.' and '..' segments in an absolute path (no filesystem access).
  function normalizePath(p) {
    const out = [];
    for (const seg of p.split('/')) {
      if (seg === '' || seg === '.') continue;
      if (seg === '..') out.pop();
      else out.push(seg);
    }
    return '/' + out.join('/');
  }

  function onKey(e) {
    // Esc closes the picker if it's open; otherwise it quits, but only in
    // read-only View mode — never mid-edit, so an errant Esc while typing (or in
    // Split/Diff) can't discard work by closing.
    if (e.key === 'Escape') {
      if (chooserOpen) { e.preventDefault(); chooserOpen = false; return; }
      if (mode === 'view') { e.preventDefault(); exitApp(); return; }
    }
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
    <button
      class="icon"
      class:active={sidebarOpen}
      title="Toggle folder sidebar"
      aria-label="Toggle folder sidebar"
      onclick={toggleSidebar}
    >☰</button>
    <div class="file">
      <span class="dot" class:dirty></span>
      <span class="name" title={filePath || ''}>{fileName}</span>
      {#if reloaded}
        <span class="reloaded-badge">updated</span>
      {/if}
      {#if filePath}
        <button
          class="icon reveal"
          title="Reveal in file manager"
          aria-label="Reveal in file manager"
          onclick={revealCurrent}
        >↗</button>
      {/if}
    </div>

    <div class="modes" role="group" aria-label="View mode">
      <button class:active={mode === 'view'} onclick={() => setMode('view')}>View</button>
      <button class:active={mode === 'edit'} onclick={() => setMode('edit')}>Edit</button>
      <button class:active={mode === 'split'} onclick={() => setMode('split')}>Split</button>
      {#if gitTracked}
        <button class:active={mode === 'diff'} title="Changes vs last commit" onclick={enterDiff}>Changes</button>
      {/if}
    </div>

    <div class="actions">
      <div class="zoom" role="group" aria-label="Zoom">
        <button aria-label="Zoom out" onclick={() => applyZoom(zoom - 0.1)}>−</button>
        <button class="zoom-level" title="Reset zoom" onclick={() => applyZoom(1)}>{Math.round(zoom * 100)}%</button>
        <button aria-label="Zoom in" onclick={() => applyZoom(zoom + 0.1)}>+</button>
      </div>
      <select
        aria-label="Reading font"
        title="Reading font"
        value={fontId}
        onchange={(e) => changeFont(e.currentTarget.value)}
      >
        {#each FONTS as f (f.id)}
          <option value={f.id}>{f.name}</option>
        {/each}
      </select>
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
      <button onclick={openFolder}>Folder</button>
      <button class="primary" onclick={save}>Save</button>
    </div>
  </header>

  <div class="workspace">
    <div id="zoom-surface" class="zoom-surface">
      {#if sidebarOpen}
        <Sidebar {folderName} files={folderFiles} activePath={filePath} onSelect={openPath} />
      {/if}
      <main class="body" class:split={mode === 'split' && !chooserOpen}>
        {#if chooserOpen}
          <section class="pane">
            <Chooser dir={chooserDir} files={chooserFiles} onPick={pickFromChooser} onClose={() => (chooserOpen = false)} />
          </section>
        {:else if mode === 'diff'}
          <section class="pane">
            <DiffView previous={previousContent} current={content} />
          </section>
        {:else}
          {#if mode === 'edit' || mode === 'split'}
            <section class="pane editor-pane">
              <Editor value={content} onChange={onEditorChange} />
            </section>
          {/if}
          {#if mode === 'view' || mode === 'split'}
            <section class="pane preview-pane">
              <Preview source={content} {onLink} pulseTick={refreshTick} scrollKey={filePath || ''} />
            </section>
          {/if}
        {/if}
      </main>
    </div>
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg);
    color: var(--fg);
  }

  .workspace {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .zoom-surface {
    display: flex;
    width: 100%;
    height: 100%;
    transform-origin: 0 0;
  }

  .reloaded-badge {
    flex: none;
    font-size: 10px;
    line-height: 1;
    padding: 3px 6px;
    border-radius: 999px;
    background: var(--accent);
    color: var(--accent-fg);
    letter-spacing: 0.03em;
    text-transform: uppercase;
    animation: badge-fade 1.1s ease-out forwards;
  }
  @keyframes badge-fade {
    0% { opacity: 0; transform: translateY(-2px); }
    15% { opacity: 1; transform: translateY(0); }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px;
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
    font-size: 14px;
  }
  .dot {
    width: 9px;
    height: 9px;
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

  .icon {
    padding: 0 10px;
    font-size: 16px;
    line-height: 1;
    flex: none;
  }
  .icon.active {
    background: var(--accent);
    color: var(--accent-fg);
    border-color: var(--accent);
  }
  .reveal {
    height: 24px;
    padding: 0 7px;
    font-size: 13px;
    color: var(--muted);
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
    font-size: 14px;
    height: 34px;
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
    height: 34px;
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
    padding: 0 14px;
  }
  .modes button:last-child { border-right: none; }
  .zoom button { padding: 0 12px; }
  .zoom .zoom-level {
    min-width: 56px;
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
    min-width: 0;
    min-height: 0;
    height: 100%;
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
