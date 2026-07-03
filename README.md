# markm

A fast, themeable **native Linux markdown viewer with an edit mode** — a real
standalone app (not a browser tab, not part of an IDE) that you register as the
handler for markdown files, so `xdg-open file.md` just opens it.

Built because every alternative was one of: ugly, couldn't switch themes, slow,
or trapped inside something like VS Code.

## Features

- **View / Edit / Split** modes — read rendered markdown, edit the source
  (CodeMirror 6), or see both side by side.
- **Many themes** — Light, Dark, Dracula, Nord, Solarized Light, Gruvbox Dark,
  Rosé Pine. One switch restyles the chrome, the preview, *and* the editor.
- **Zoom** — `Ctrl` `+` / `Ctrl` `-` / `Ctrl` `0`, or the toolbar control.
- **Remembers everything** — theme, zoom, and view mode persist across launches.
- **Native file handling** — open/save dialogs, and `xdg-open` / "Open With"
  integration via a `.desktop` entry + `text/markdown` MIME association.
- **Tiny & fast** — a ~1.8 MB native binary that renders through the system
  WebKitGTK; no bundled browser, no Electron bloat.

## Keyboard shortcuts

| Shortcut            | Action            |
|---------------------|-------------------|
| `Ctrl` `E`          | Toggle edit/view  |
| `Ctrl` `S`          | Save              |
| `Ctrl` `O`          | Open              |
| `Ctrl` `+` / `-`    | Zoom in / out     |
| `Ctrl` `0`          | Reset zoom        |

## Tech stack

- **[Neutralino.js](https://neutralino.js.org/)** — native shell that uses the
  OS WebKitGTK (no bundled runtime). See [SPEC.md](SPEC.md) for why this over
  Tauri/Electron.
- **[Svelte 5](https://svelte.dev/)** + **[Vite](https://vite.dev/)** — frontend.
- **[CodeMirror 6](https://codemirror.net/)** — source editor.
- **[markdown-it](https://github.com/markdown-it/markdown-it)** — renderer.

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

### Redistribution

`neu build` produces the portable binary + `resources.neu` bundle — the basis
for an AppImage / `.deb` / tarball. Node is **only** a build-time tool; it is
never shipped. See [SPEC.md](SPEC.md#distribution).

## Documentation

- [SPEC.md](SPEC.md) — what markm is, the architecture, and why these choices.
- [JOURNAL.md](JOURNAL.md) — decisions and gotchas, newest first.

## License

All rights reserved (personal project).
