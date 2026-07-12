# markm — Specification

## Identity

- **Name:** markm
- **Type:** Desktop application (native Linux; markdown viewer + editor)
- **Language:** JavaScript/Svelte frontend in a Neutralino native shell
- **Created:** 2026-07-03

## Purpose

A fast, good-looking, themeable markdown **viewer with an edit mode**, delivered
as a proper standalone Linux application — registered as the handler for
markdown files so `xdg-open file.md` opens it.

## Motivation

Existing markdown tools each failed on at least one axis: not nice-looking,
couldn't change themes, slow, or only existed as part of a heavyweight editor
like VS Code. markm targets all four: attractive (full CSS control), many
themes, fast (native shell, no bundled browser), and standalone.

## Core behavior

- Opens a markdown **file** passed on the command line / via `xdg-open` / a file
  manager, or via the in-app **Open** dialog. Opening a **directory** (`markm .`)
  shows a picker of the folder's markdown files with type-to-filter and sort by
  modified/name.
- Modes: **View** (rendered), **Edit** (CodeMirror source), **Split**, and —
  when the file is git-tracked — **Changes** (word-level diff vs HEAD, insertions
  highlighted / deletions struck through).
- **Live auto-refresh:** watches the open file and reloads on external change,
  highlighting the changed blocks; a dirty buffer is never clobbered.
- **Save** / **Save As** through native dialogs; window title shows a dirty dot.
- **Theme switching** across a catalog of light/dark themes, plus a **reading-font**
  choice; both apply live to chrome + preview + editor via CSS variables. The
  reading font auto-scales with pane width (content fills the window).
- **Syntax highlighting** of fenced code blocks (highlight.js, a fixed language
  set — no auto-detection), themed through per-theme `--syn-*` variables, with a
  hover **Copy** button per block.
- **Clickable links** — external → browser, local `.md` → viewer, `#anchor` → scroll.
- A **folder sidebar** switches between markdown files in the current directory.
- **Zoom** in/out/reset (keyboard + toolbar), scaling the document workspace
  while keeping toolbar/chrome fixed-size. **Esc** closes (in View mode / the
  picker).
- **Persists** theme, reading font, zoom, view mode, folder + sidebar state, and
  **scroll position per file** between launches (Neutralino storage).
- The console launcher **detaches** from the terminal by default (`--fg` to stay).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Neutralino native binary (C++, ~1.8 MB, prebuilt)        │
│  • opens a WebKitGTK window                               │
│  • serves the frontend over a local server               │
│  • exposes native APIs (filesystem, os dialogs, storage) │
│         ▲  local WebSocket bridge (neutralino.js)         │
│         ▼                                                 │
│ Frontend (Svelte 5, compiled by Vite → dist/)            │
│  App.svelte ── state: content, mode, theme, font, zoom,   │
│                file, folder/sidebar, git, scroll, chooser │
│   ├─ Editor.svelte  → CodeMirror 6 (lib/editor.js)        │
│   ├─ Preview.svelte → markdown-it (+ highlight, copy,     │
│                       links, pulse, scroll)               │
│   ├─ DiffView.svelte→ word-level diff vs HEAD (jsdiff)    │
│   ├─ Sidebar.svelte → folder file list                    │
│   ├─ Chooser.svelte → directory-launch file picker        │
│   ├─ lib/themes.js  → CSS-variable theme catalog          │
│   ├─ lib/fonts.js   → reading-font catalog                │
│   ├─ lib/highlight.js → highlight.js core + language set  │
│   └─ lib/neu.js     → native wrappers (fs, dialogs,       │
│                       storage, file-watch, git via exec)  │
└─────────────────────────────────────────────────────────┘
```

- The frontend is plain web tech executed by **WebKitGTK's** JS engine — not
  Node. Node/Vite only compile it ahead of time.
- Theming is CSS custom properties on `<html>`; CodeMirror's theme and the
  markdown preview both read the same `var(--...)` tokens, so one switch
  restyles everything with no reconfigure.

## Tech stack

| Concern        | Choice                              |
|----------------|-------------------------------------|
| Native shell   | Neutralino.js v6.8.0 (binaries) / neu CLI v11 |
| Frontend       | Svelte 5 + Vite 6                   |
| Source editor  | CodeMirror 6                        |
| Renderer       | markdown-it 14                      |
| Code highlighting | highlight.js 11 (core + explicit languages) |
| Diff (Changes) | diff (jsdiff) 5                     |
| Rendering engine | system WebKitGTK 4.1 (not bundled) |

## Why Neutralino (not Tauri / Electron / a Rust GUI)

Decision trail (full rationale in [JOURNAL.md](JOURNAL.md)):

- **Best editing + modern look ⇒ web tech.** Native Rust GUI editors
  (iced/egui) can't match CodeMirror/Milkdown. So the UI is web-based.
- **Constraint: no new system packages.** Tauri needs `libwebkit2gtk-4.1-dev`
  (build headers) installed; the user declined new installs.
- **Constraint: no bloat.** Electron bundles ~150 MB of Chromium — the very
  weight markm exists to avoid.
- **Neutralino threads the needle:** it renders with the **already-installed**
  system WebKitGTK 4.1, ships **prebuilt binaries** (no compilation, no dev
  headers), and produces a ~2 MB app. Verified the box's `libwebkit2gtk-4.1.so.0`
  satisfies its runtime dlopen.

Trade-off accepted: Neutralino has a thinner native API and smaller ecosystem
than Tauri/Electron — fine for this app's scope (open/save/watch files, window,
storage).

## Distribution

- `neu build --release` emits `dist/markm/markm-linux_x64` + `resources.neu`
  (the web bundle). Those two side-by-side **are** the distributable.
- `scripts/package-macos-app.sh` runs on macOS and wraps the Neutralino macOS
  binary + `resources.neu` into `dist/macos/markm.app` with a standard
  `Contents/Info.plist`, launcher, and generated `appIcon.icns`.
- **Node is never shipped** — build-time only.
- Runtime dependency on the target: system WebKitGTK (declare
  `libwebkit2gtk-4.1-0` in a `.deb`).
- `scripts/install.sh` does a local (`~/.local`) install: app files, a
  `text/markdown` MIME package, an icon, a `.desktop` entry, and sets markm as
  the default markdown handler. Launch is CWD-independent via `--path=<appdir>`.
- macOS `.app` packaging uses the same `--path` rule through a tiny
  `Contents/MacOS/markm` launcher so Finder's arbitrary CWD cannot break
  `resources.neu` lookup. The bundle is unsigned/not notarized.

## Constraints

- Linux + a WebKitGTK-providing desktop (developed on Ubuntu GNOME / Wayland).
- No new system packages required to build or run.
- Must feel fast (native startup) and look good (theme-first design).

## What markm is NOT

- Not a full IDE or multi-file project editor.
- Not a browser tab / web app (explicitly rejected — must be a registered app).
- Not an Electron app (no bundled browser engine).
- Not a cross-format document editor — markdown only.
