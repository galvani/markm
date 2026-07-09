# markm

A fast, themeable **native Linux markdown viewer with an edit mode** — a real
standalone app (not a browser tab, not part of an IDE) that you register as the
handler for markdown files, so `xdg-open file.md` just opens it.

Built because every alternative was one of: ugly, couldn't switch themes, slow,
or trapped inside something like VS Code.

## Features

- **View / Edit / Split** modes — read rendered markdown, edit the source
  (CodeMirror 6), or see both side by side.
- **Live auto-refresh** — markm watches the open file; when it changes on disk it
  reloads automatically and briefly **highlights the changed blocks** (they settle
  into a subtle tint until the next change). Unsaved edits are never clobbered — a
  dirty buffer is left alone.
- **Git "Changes" view** — for a file under git, a word-level diff against the last
  commit (HEAD): **insertions highlighted, deletions struck through**. The button
  appears only when the open file is tracked.
- **Open a file or a whole folder** — a sidebar switches between the markdown files
  in a folder; launching on a directory (`markm .`, `markm /some/dir`) opens a
  picker with **type-to-filter** and sort by **modified** (default) or **name**.
- **Clickable links** — external links open in your browser, local `.md` links open
  in markm, and `#anchors` scroll the page.
- **Many themes** — Light, Dark, Dracula, Nord, Solarized Light, Gruvbox Dark,
  Rosé Pine. One switch restyles the chrome, the preview, *and* the editor.
- **Reading font** — choose System / Sans / Serif / Mono. The font **auto-scales as
  you widen the window** so line length stays readable while the content fills the
  width (no letter-boxing).
- **Zoom** — `Ctrl` `+` / `Ctrl` `-` / `Ctrl` `0`, or the toolbar control.
  Zoom scales the document workspace fully; toolbar/chrome scales only within a
  bounded readable range.
- **Remembers everything** — theme, reading font, zoom, view mode, the folder +
  sidebar state, and **scroll position per file** persist across launches.
- **Native file handling** — open/save dialogs, and `xdg-open` / "Open With"
  integration via a `.desktop` entry + `text/markdown` MIME association.
- **Runs detached from the terminal** — `markm file.md` frees your shell prompt;
  pass `--fg` (or `MARKM_FG=1`) to keep it in the foreground.
- **Tiny & fast** — a ~1.8 MB native binary that renders through the system
  WebKitGTK; no bundled browser, no Electron bloat.

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

All rights reserved (personal project).
