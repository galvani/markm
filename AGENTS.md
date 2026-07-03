# markm — Agent instructions

A native Linux markdown viewer/editor: **Neutralino** shell + **Svelte 5/Vite**
frontend + **CodeMirror 6** editor + **markdown-it** renderer. Full picture in
[SPEC.md](SPEC.md); decisions and gotchas in [JOURNAL.md](JOURNAL.md).

## Documentation map

- **[SPEC.md](SPEC.md)** — what markm is, architecture, why Neutralino.
- **[JOURNAL.md](JOURNAL.md)** — dated decisions + gotchas (read before touching
  zoom, launch/`--path`, theming, or the native bridge).
- **[README.md](README.md)** — user-facing usage, build/install.

## Layout

```
neutralino.config.json   native shell config (documentRoot=/dist/, --path aware)
index.html               loads neutralino.js (classic) + the Svelte module
src/
  main.js                mounts App
  App.svelte             top-level state: content, mode, theme, zoom, file, dirty
  app.css                base + rendered-markdown styles (theme-var driven)
  lib/
    neu.js               degradable wrappers over the Neutralino native API
    themes.js            CSS-variable theme catalog + applyTheme
    editor.js            CodeMirror 6 setup (theme via var(--...))
    Editor.svelte        CodeMirror host component
    Preview.svelte       markdown-it render
desktop/markm.desktop.in .desktop template (@EXEC@/@APPDIR@/@ICON@)
mime/markm-markdown.xml  text/markdown MIME package
scripts/install.sh       local install + MIME/desktop registration
bin/                     Neutralino binaries (gitignored; from `neu update`)
```

## Fast dev / verify recipe

```bash
export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"   # Node is via nvm
export XDG_RUNTIME_DIR=/run/user/1000                       # for the GUI
pnpm install
pnpm build                       # vite -> dist/  (must succeed clean)
pnpm exec neu run --disable-auto-reload   # launches the native window
```

There is no test suite yet; "verify" = `pnpm build` is clean **and** the app
launches and renders. When changing packaging, also run `install.sh` and
`desktop-file-validate ~/.local/share/applications/markm.desktop`.

## Conventions

- Theme everything through **CSS custom properties** (see `themes.js`). Never
  hard-code colors in components — add/consume `var(--token)` so new themes work
  automatically. This includes CodeMirror (its theme uses `var(--...)`).
- Keep `lib/neu.js` the **only** place that touches `window.Neutralino`, and keep
  every wrapper **degradable** (works when the native bridge is absent).
- Svelte 5 runes (`$state`/`$derived`/`$effect`/`$props`), not legacy stores.
- Comment the *why* for non-obvious bits (the zoom transform, the `--path`
  launch) — those are the traps in JOURNAL.md.

## Hard rules / what NOT to do

- **Don't use the CSS `zoom` property** — WebKitGTK ignores it. Use the
  `transform: scale()` approach already in `applyZoom`.
- **Don't launch the built binary without `--path=<appdir>`** — it resolves
  `resources.neu` from CWD and will exit instantly under `xdg-open`.
- **Don't set `enableInspector: true`** in a shipping config (auto-opens
  devtools).
- **Don't stop long-running processes with `pkill -f`** — match by exact PID
  (`ps -eo pid,comm | grep neutralino`) or `systemctl --user`.
- Don't add heavyweight deps that pull in a second rendering engine — the whole
  point is the ~2 MB native shell over system WebKitGTK.
