# markm — Journal

Newest first. Decisions, rationale, and gotchas worth not re-deriving.

## 2026-07-03 — Folder sidebar + editor selection fix

- **Feature:** folder sidebar — in-app **Folder** button opens a directory,
  sidebar lists its markdown files (top-level, non-recursive) to switch between;
  `☰` toggles it. Hidden on startup **unless open last session** (persist
  `sidebarOpen` + `folder`). Plus a **reveal-in-file-manager** (`↗`) action
  (`os.open` on the file's dir). Did NOT register markm as a directory MIME
  handler (out of scope).
- **Bug fixed — no keyboard text selection in the editor.** Two causes/fixes:
  1. The zoom `transform: scale()` was applied even at 100% (`scale(1)`). A
     transformed ancestor breaks CodeMirror's selection coordinate measurement
     in WebKitGTK. Fix: apply no transform at all when `zoom === 1`.
  2. Dropped CodeMirror's `drawSelection()` → use **native browser selection**
     (styled via `.cm-content ::selection`), which is robust under a transform.
  Rule: **don't wrap CodeMirror in a CSS-transformed ancestor**; if zooming,
  keep the 100% case transform-free.
- **Known fl: `neu run` sometimes exits immediately (code 0) on a fresh launch**
  right after "neu CLI connected" — an intermittent startup race, not stale
  state (recurs even after clearing `.tmp`/`.storage`). A retry launches fine.
  Watch whether the installed (`--path`) build shows it too.

## 2026-07-03 — Project bootstrapped, first working app

### Stack decision (the winding path)

The requirement — a *nice, fast, themeable* markdown viewer with edit mode, as a
**registered Linux app** (xdg-open), **without installing packages the box
didn't have** — drove several pivots:

1. **Browser web app** — rejected: user wants a real registered app, not a tab.
2. **Tauri + Svelte** — great fit, but needs `libwebkit2gtk-4.1-dev` build
   headers; user declined new `apt` installs.
3. **Pure-Rust GUI (iced)** — zero-install and tiny, but native editors can't
   match web editors. User correctly pushed back: "check what language has good
   markdown editing and looks modern." → that's web tech (CodeMirror/Milkdown).
4. **Neutralino + Svelte + CodeMirror** — the winner. Uses the **already-present**
   system WebKitGTK 4.1, ships **prebuilt binaries** (no dev headers, no compile),
   ~2 MB. Best editing + modern look + zero install + tiny. See SPEC.md.

- **Decision:** frontend = Svelte 5 + Vite; editor = CodeMirror 6; renderer =
  markdown-it; shell = Neutralino v6.8.0.
- Verified before committing: the box's `libwebkit2gtk-4.1.so.0` satisfies the
  Neutralino binary's runtime dlopen (it accepts 4.0 *or* 4.1).

### Gotchas discovered (don't re-learn these)

- **WebKitGTK does NOT support the CSS `zoom` property** (that's a Blink/Chrome
  extension). Ctrl +/- zoom must use `transform: scale()` on the mount node with
  an inverse `width`/`height` (`100/z %` / `vh`) so content reflows. See
  `applyZoom` in `src/App.svelte`.
- **Neutralino's production binary resolves `resources.neu` relative to the
  current working directory.** Launched by `xdg-open` (CWD `/` or `$HOME`) it
  can't find the bundle and exits instantly. Fix: launch with
  `--path=<appdir>`; the `.desktop` `Exec` and the `~/.local/bin/markm` wrapper
  both pass it. This is why `install.sh` bakes `--path` in.
- **`enableInspector: true` auto-opens the WebKit inspector** ("developer
  toolbar") on start. Set it `false` in `neutralino.config.json`.
- **NL_* globals** (`NL_TOKEN`, `NL_PORT`, `NL_ARGS`) are injected by the native
  runtime before page scripts run; the version-matched `neutralino.js` client is
  loaded as a classic `<script>` from `public/` (copied to `dist/` root by Vite)
  so `window.Neutralino` exists for the Svelte app.
- **Stale `.tmp/window_state.config.json` / `.storage`** left by rapid
  kill/relaunch cycles can make a fresh `neu run` exit immediately with code 0.
  Deleting `.tmp` and `.storage` in the repo fixes it. (Both are gitignored.)
- **The file arg** arrives via `window.NL_ARGS`; `lib/neu.js#launchFilePath`
  skips flags, takes the first plain arg, and normalises a `file://` URI.

### Persistence

- **Decision:** theme, zoom, and view mode persist via Neutralino `storage`
  (falls back to `localStorage` outside the native shell). Restored in
  `App.svelte` `onMount`.

### Linux integration

- **Decision:** ship a `text/markdown` MIME package + `.desktop` entry + icon;
  `install.sh` registers markm as the default markdown handler under `~/.local`
  (no root). `uninstall.sh` reverses it.

---

## Template for future entries

## YYYY-MM-DD — {title}

- **Decision:** {what} — **Rationale:** {why} — **Alternatives:** {what else}
- **Gotcha:** {trap and the rule that avoids it}
