<h1 align="center">markm</h1>

<p align="center">
  <b>The markdown viewer Linux never had.</b><br>
  A real standalone app — not a browser tab, not an IDE panel — that opens in a
  blink, gets out of your way, and looks good doing it.
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-black">
  <img alt="Platform: Linux" src="https://img.shields.io/badge/platform-Linux%20%2B%20macOS-black">
  <img alt="Binary size: 1.8 MB" src="https://img.shields.io/badge/binary-1.8%20MB-black">
  <img alt="No Electron" src="https://img.shields.io/badge/Electron-none-black">
</p>

![markm showing its own spec in the Gruvbox Dark theme](docs/screenshot.png)

## Why markm

Every other option was ugly, slow, stuck on one theme, or trapped inside VS Code.
markm is the one that gets these four things right:

> **⚡ Throwaway by design.**
> `markm file.md` **hands your shell prompt straight back** (it detaches), and
> **`Esc` closes it**. Reading a markdown file costs one command and one keystroke
> — no job parked in your terminal, no window to hunt down and close.

> **🎨 Sixteen themes, applied everywhere.**
> One switch restyles the chrome, the rendered page, the code blocks *and* the
> editor together — Dracula, Nord, Tokyo Night, Catppuccin, Gruvbox, Everforest,
> Solarized, Rosé Pine, One Dark, Monokai… Most viewers give you one look, or a
> theme that stops at the preview pane.

> **✍️ It's an editor too — and a git diff.**
> View, Edit, or Split (CodeMirror 6). The file is **watched live**: change it on
> disk and markm reloads and **highlights exactly what changed**, without ever
> clobbering your unsaved edits. For a tracked file, **Changes** shows a word-level
> diff against HEAD.

> **🪶 1.8 MB, native, instant.**
> It renders through the system WebKitGTK — no bundled Chromium, no Electron, no
> 200 MB install. Register it once and `xdg-open any.md` just works.

## Everything else

- **Browse** — one button opens the folder holding the current document, with that
  document **preselected**; **type-to-filter**, sort by **modified** (default) or
  **name**, and jump to any other folder from there. The same picker greets you when
  markm is launched on a directory (`markm .`, `markm /some/dir`), and a sidebar
  switches between the markdown files in the folder.
- **Syntax-highlighted code blocks** — bash, sql, php, js/ts, python, go, rust,
  json, yaml, css, html, ini, diff, dockerfile, markdown. Colors come from the
  active theme. Hover a block for a **Copy** button.
- **Images render** — local images referenced from the markdown (relative or
  absolute paths) display inline.
- **Clickable links** — external links open in your browser, local `.md` links open
  in markm, and `#anchors` scroll the page.
- **Reading font** — System / Sans / Serif / Mono, and it **auto-scales as you widen
  the window** so line length stays readable while the content fills the width (no
  letter-boxing). Font and theme live in the **☰ menu**, so the toolbar stays clean.
- **Zoom** — `Ctrl` `+` / `Ctrl` `-` / `Ctrl` `0`, or the toolbar control. Zoom
  scales the document; the toolbar stays fixed-size.
- **Remembers everything** — theme, font, zoom, view mode, folder + sidebar state,
  **scroll position per file**, and **window size per file** (toggleable in the ☰
  menu) persist across launches.
- **Native file handling** — open/save dialogs, and `xdg-open` / "Open With"
  integration via a `.desktop` entry + `text/markdown` MIME association.

## Keyboard shortcuts

| Shortcut         | Action                        |
|------------------|-------------------------------|
| `Ctrl` `E`       | Toggle edit/view              |
| `Ctrl` `S`       | Save                          |
| `Ctrl` `O`       | Open                          |
| `Ctrl` `+` / `-` | Zoom in / out                 |
| `Ctrl` `0`       | Reset zoom                    |
| `Esc`            | Close (in View mode / picker) |

## Tech stack

- **[Neutralino.js](https://neutralino.js.org/)** — native shell that uses the
  OS WebKitGTK (no bundled runtime). See [SPEC.md](SPEC.md) for why this over
  Tauri/Electron.
- **[Svelte 5](https://svelte.dev/)** + **[Vite](https://vite.dev/)** — frontend.
- **[CodeMirror 6](https://codemirror.net/)** — source editor.
- **[markdown-it](https://github.com/markdown-it/markdown-it)** — renderer.
- **[diff](https://github.com/kpdecker/jsdiff)** — word-level diff for the Changes view.

## Develop

Requires Node (via nvm) and pnpm.

```bash
pnpm install
pnpm build        # compile the Svelte frontend into dist/
pnpm app          # launch the native window (neu run)
# or in one step:
pnpm start
```

`pnpm dev` runs `vite build --watch` for an iterative loop (rebuilds dist/ on
change; relaunch `pnpm app` to pick changes up).

## Build & install (as a real Linux app)

```bash
pnpm build
pnpm exec neu build --release     # -> dist/markm/markm-linux_x64 + resources.neu
scripts/install.sh                # installs under ~/.local, registers MIME + .desktop
```

Then `xdg-open any.md` (or a file manager, or "Open With") launches markm.
Remove with `scripts/uninstall.sh`.

### Build a macOS `.app`

Run this on macOS:

```bash
pnpm install
scripts/package-macos-app.sh          # universal app: dist/macos/markm.app
# or: pnpm run package:macos-app
# or: scripts/package-macos-app.sh arm64
# or: scripts/package-macos-app.sh x64
open dist/macos/markm.app
```

The script builds the Svelte bundle, runs `neu build --release`, creates
`appIcon.icns` from `public/icons/appIcon.png` with macOS `sips`/`iconutil`, and
wraps the Neutralino binary in a normal `markm.app/Contents/...` bundle. It is
not signed or notarized.

### Redistribution

`neu build` produces the portable binary + `resources.neu` bundle — the basis
for an AppImage / `.deb` / tarball. `scripts/package-macos-app.sh` produces a
macOS `.app` bundle. Node is **only** a build-time tool; it is never shipped. See
[SPEC.md](SPEC.md#distribution).

## Documentation

- [BUILD.md](BUILD.md) — Linux install and macOS `.app` build steps.
- [SPEC.md](SPEC.md) — what markm is, the architecture, and why these choices.
- [JOURNAL.md](JOURNAL.md) — decisions and gotchas, newest first.

## License

[MIT](LICENSE) — open source. Built by [Jan Kozak](https://galvani.github.io).
