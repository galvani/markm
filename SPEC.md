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

- Opens a markdown file passed on the command line / via `xdg-open` / a file
  manager, or via the in-app **Open** dialog.
- Three modes: **View** (rendered), **Edit** (CodeMirror source), **Split**.
- **Save** / **Save As** through native dialogs; window title shows a dirty dot.
- **Theme switching** across a catalog of light/dark themes; applies live to
  chrome + preview + editor via CSS variables.
- **Zoom** in/out/reset (keyboard + toolbar), scaling the entire UI.
- **Persists** theme, zoom, and view mode between launches (Neutralino storage).

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
│  App.svelte ── state: content, mode, theme, zoom, file    │
│   ├─ Editor.svelte  → CodeMirror 6 (lib/editor.js)        │
│   ├─ Preview.svelte → markdown-it                         │
│   ├─ lib/themes.js  → CSS-variable theme catalog          │
│   └─ lib/neu.js     → thin, degradable native wrappers    │
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
- **Node is never shipped** — build-time only.
- Runtime dependency on the target: system WebKitGTK (declare
  `libwebkit2gtk-4.1-0` in a `.deb`).
- `scripts/install.sh` does a local (`~/.local`) install: app files, a
  `text/markdown` MIME package, an icon, a `.desktop` entry, and sets markm as
  the default markdown handler. Launch is CWD-independent via `--path=<appdir>`.

## Constraints

- Linux + a WebKitGTK-providing desktop (developed on Ubuntu GNOME / Wayland).
- No new system packages required to build or run.
- Must feel fast (native startup) and look good (theme-first design).

## What markm is NOT

- Not a full IDE or multi-file project editor.
- Not a browser tab / web app (explicitly rejected — must be a registered app).
- Not an Electron app (no bundled browser engine).
- Not a cross-format document editor — markdown only.
