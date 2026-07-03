// Thin wrapper around the Neutralino native API.
//
// Everything here degrades gracefully when `window.Neutralino` is absent
// (e.g. the Vite bundle opened in a plain browser during development), so the
// UI never hard-crashes just because the native bridge isn't there. Inside the
// real app the globals (NL_TOKEN/NL_PORT/NL_ARGS) are injected by the runtime.

const N = typeof window !== 'undefined' ? window.Neutralino : undefined;

export const hasNative = !!N;

let initialized = false;

/** Initialise the native bridge and wire the graceful-exit handlers. */
export function initNative() {
  if (!N || initialized) return;
  N.init();
  // A borderless-less window still emits windowClose; exit the process so the
  // native side doesn't linger (config uses exitProcessOnClose:false).
  N.events.on('windowClose', () => N.app.exit());
  initialized = true;
}

/**
 * The file path markm was launched with, if any.
 * xdg-open / file managers pass the path as the first non-flag CLI argument;
 * Neutralino exposes them via window.NL_ARGS.
 */
export function launchFilePath() {
  const args = (typeof window !== 'undefined' && window.NL_ARGS) || [];
  // NL_ARGS[0] is the binary path; flags start with '-'. Take the first plain arg.
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (typeof a === 'string' && !a.startsWith('-')) {
      // File managers may hand us a file:// URI (%U); normalise to a path.
      return a.startsWith('file://') ? decodeURIComponent(a.slice(7)) : a;
    }
  }
  return null;
}

/** Read a UTF-8 text file. Returns null on failure. */
export async function readTextFile(path) {
  if (!N) return null;
  try {
    return await N.filesystem.readFile(path);
  } catch {
    return null;
  }
}

/** Write a UTF-8 text file. Returns true on success. */
export async function writeTextFile(path, data) {
  if (!N) return false;
  try {
    await N.filesystem.writeFile(path, data);
    return true;
  } catch {
    return false;
  }
}

/** Show the native "open file" dialog; returns a path or null. */
export async function pickOpenPath() {
  if (!N) return null;
  const entries = await N.os.showOpenDialog('Open markdown file', {
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'txt'] },
      { name: 'All files', extensions: ['*'] },
    ],
  });
  return entries && entries.length ? entries[0] : null;
}

/** Show the native "open folder" dialog; returns a directory path or null. */
export async function pickFolderPath() {
  if (!N) return null;
  const path = await N.os.showFolderDialog('Open folder');
  return path || null;
}

const MD_EXT = new Set(['md', 'markdown', 'mdown', 'mkd', 'mkdn']);

/**
 * List markdown files directly inside a folder (non-recursive), sorted by name.
 * Returns [{ name, path }]. Empty array on failure.
 */
export async function listMarkdownFiles(dir) {
  if (!N) return [];
  try {
    const entries = await N.filesystem.readDirectory(dir);
    return entries
      .filter((e) => (e.type || '').toUpperCase() !== 'DIRECTORY')
      .filter((e) => MD_EXT.has((e.entry.split('.').pop() || '').toLowerCase()))
      .map((e) => ({ name: e.entry, path: `${dir}/${e.entry}` }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/** Open the OS file manager at a file's containing folder (reveal). */
export async function revealInFileManager(filePath) {
  if (!N || !filePath) return;
  const dir = filePath.slice(0, filePath.lastIndexOf('/')) || '/';
  try {
    await N.os.open(dir);
  } catch {
    /* non-fatal */
  }
}

/** Show the native "save as" dialog; returns a path or null. */
export async function pickSavePath(suggested = 'untitled.md') {
  if (!N) return null;
  const path = await N.os.showSaveDialog('Save markdown file', {
    defaultPath: suggested,
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown'] },
      { name: 'All files', extensions: ['*'] },
    ],
  });
  return path || null;
}

/** Persist a small key/value using native storage, with a localStorage fallback. */
export async function saveSetting(key, value) {
  try {
    if (N) await N.storage.setData(key, value);
    else localStorage.setItem(key, value);
  } catch {
    /* non-fatal */
  }
}

/** Read a persisted setting; returns null if unset. */
export async function loadSetting(key) {
  try {
    if (N) return await N.storage.getData(key);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Update the OS window title. */
export async function setWindowTitle(title) {
  if (!N) {
    document.title = title;
    return;
  }
  try {
    await N.window.setTitle(title);
  } catch {
    /* non-fatal */
  }
}
