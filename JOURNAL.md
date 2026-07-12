# markm — Journal

Newest first. Decisions, rationale, and gotchas worth not re-deriving.

## 2026-07-12 — Storage keys were silently broken; per-file window geometry

- **Neutralino storage keys must match `^[a-zA-Z0-9_-]+$`** (each key becomes a
  file name); anything else is refused with `NE_ST_INVSTKY`. Our per-file keys
  embed a path (`scroll:/home/x/a.md`), so **every write failed** — swallowed by
  the `catch` in `saveSetting`. The per-file scroll memory the README advertised
  had therefore never once persisted. `safeKey()` (neu.js) now folds any key into
  the allowed alphabet and appends a hash of the original (two paths can fold to
  the same string). Any new per-file key gets this for free — don't bypass
  saveSetting/loadSetting.
- **Per-file window geometry**, same shape as the scroll memory: a file reopens at
  the size/place you last read it at. Neutralino fires no move/resize event, so a
  1.5 s poll persists it only when it changed. Toggle in the ☰ menu, default on.
  **Wayland caveat:** `window.getPosition()` returns 0,0 — the compositor doesn't
  expose window position — so in practice this remembers SIZE, not position.
- **Flash of the welcome doc on launch** (Jan spotted it): `content` was seeded
  with `WELCOME`, which painted for a frame before `onMount` loaded the real file.
  It now starts empty, and WELCOME is installed only when no file/dir was passed.
- **Borderless does not work on KDE/Wayland.** `"borderless": true` in
  neutralino.config.json AND `window.setBorderless(true)` at runtime both leave
  KWin's server-side title bar in place. The toolbar is nonetheless prepared to BE
  the title bar: two empty fillers are `setDraggableRegion` handles (drag to move,
  double-click to maximize) and there are in-app – ▢ ✕ controls. Removing the real
  bar needs a **KWin window rule** ("No titlebar and frame"), i.e. user config, not
  something the app can do.
- **Ctrl + wheel zooms** (inverted per Jan: wheel up = zoom out).

## 2026-07-12 — Images render, nine themes, icon mode switch, Browse, MIT

- **Local images now display, and the reason they didn't is worth keeping.** The
  webview page is served over `http://localhost`, and WebKit refuses `file://`
  subresources from an http origin — so an `<img>` pointing at a path on disk can
  never load, no matter how the path is written. The fix inlines the bytes:
  `readImageDataUrl()` (neu.js) reads the file with `readBinaryFile` and returns a
  `data:` URI; Preview resolves relative srcs against the open file's directory,
  emits `data-local-src` with an EMPTY `src` (a real src would flash a broken-image
  icon before the swap), and fills them in after each render, cached per path.
  base64 is built in 32 KB chunks — `String.fromCharCode(...bytes)` blows the
  argument limit on anything but a tiny image.
- **Nine more themes** (16 total): Catppuccin Mocha/Latte, Tokyo Night, One Dark,
  Everforest Dark, Monokai, Solarized Dark, Gruvbox Light, Rosé Pine Dawn. Each
  ships its own `--syn-*` five-token palette, as the earlier entry requires.
- **Mode switch is icon-only** (inline SVG, `stroke: currentColor` so it themes
  itself). No icon font is shipped.
- **Open + Folder collapsed into one "Browse"**: it opens the picker on the folder
  of the *current* document with that document preselected and scrolled into view.
  The picker grew an "Other folder…" button — that's now the only route to the
  native folder dialog, so don't remove it.
- **License: MIT** (was "all rights reserved"). Author Jan Kozak / galvani.

## 2026-07-12 — Appearance menu (font + theme) + README screenshot

- **Font and theme moved behind a ☰ menu** at the right of the toolbar: the two
  native `<select>`s were the widest chrome in the toolbar and are set once and
  rarely touched, so they now live in a popover. The button next to them stays
  visible so the setting is still one click away.
- **Closing the popover:** the window `click` handler closes it only when the
  event target is outside the popover root (`settingsEl.contains(e.target)`),
  rather than a `stopPropagation` on the menu div — that variant needs an
  `onclick` on a non-interactive element and trips two Svelte a11y warnings.
  `Esc` closes the menu before it can reach the quit/picker branches.
- **Screenshot** in `docs/screenshot.png`, linked from the README.
- **Known gap surfaced by it:** the preview rendered a broken-image icon for that
  relative `![](docs/screenshot.png)` — images didn't display at all. Fixed in the
  entry above.

## 2026-07-12 — Code-block syntax highlighting + copy button

- **Library:** highlight.js, imported as `lib/core` + an explicit language list
  (`lib/highlight.js`) — the `highlight.js` barrel pulls ~190 grammars. No
  auto-detection: an unknown/absent language falls back to escaped plain text,
  because detection guesses wrong on short snippets more often than it helps.
- **Gotcha (why themes gained `--syn-*` vars):** mapping hljs classes onto the
  existing UI vars looked free but is wrong — Light, Dark, Nord and Solarized all
  set `--accent` and `--link` to the SAME hex, so keywords and strings rendered
  identically, and `--heading` ≈ `--fg` in the GitHub themes. Each theme now
  carries its own five-token palette (`--syn-keyword/string/name/number/comment`)
  from its real upstream colors. A new theme MUST ship one.
- **Copy button:** a custom `fence` renderer wraps each block in `.code-block`
  (kept as ONE top-level child so the auto-refresh pulse logic still sees one
  block per fence); the click is delegated in Preview, and copy goes through
  `Neutralino.clipboard` — `navigator.clipboard` needs a secure context, which
  the app's page isn't.

## 2026-07-12 — Zoom-out didn't shrink the preview; toolbar baseline reverted

- **Root cause (preview):** `Preview.fitFont` fitted `--reading-font` to
  `el.clientWidth`, a LAYOUT width. The zoom surface is laid out at `1/z` of its
  pane and scaled back by `z`, so layout px GROW as you zoom out — the font grew
  by exactly the factor the transform shrank it. Zoom was a no-op for the preview
  (the old comment claiming layout px "cancels the zoom transform cleanly" had it
  backwards).
- **Fix:** recover the ancestor scale from `getBoundingClientRect().width /
  offsetWidth` and fit the font to the pane's ON-SCREEN width. The fitted size
  stays in layout px so the surface transform still scales it: 17px fitted at 50%
  zoom now reads as 8.5px.
- **Toolbar:** the Jul-9 inflation (`5b1ec90`, `55890ad`: 12→16px font, 26→40px
  controls) was compensating for the then-buggy root-`#app` zoom transform, which
  shrank the chrome. Once the toolbar left the transform, that baseline was just
  oversized — reverted to the pre-inflation sizes.

## 2026-07-09 — Toolbar stays fixed during document zoom

- **Bug pattern:** toolbar appears normal at first paint, then shrinks a moment
  later after saved zoom restores. That points at the asynchronous storage
  restore path, not static toolbar CSS.
- **Decision:** document zoom scales the workspace only. Toolbar/chrome stays
  fixed-size; even a bounded toolbar scale was too visible at high document zoom.
- **Fix:** `applyZoom` always clears transform/width/height on `#app`, removes
  legacy `--chrome-scale`, then applies full zoom to `#zoom-surface`. This
  protects sessions that still have the old root-zoom implementation active
  during reload/dev cycles.

## 2026-07-09 — macOS `.app` packaging path

- **Decision:** `.app` is enough for now; no `.dmg`, signing, or notarization
  workflow yet.
- **Implementation:** `scripts/package-macos-app.sh` must run on macOS. It builds
  the web bundle, runs `neu build --release`, generates `appIcon.icns` from
  `public/icons/appIcon.png` via `sips`/`iconutil`, and creates
  `dist/macos/markm.app` with `Contents/Info.plist`.
- **Gotcha:** current `neu build --macos-bundle` only renames the macOS binary to
  `*.app`; it does not create a normal Finder bundle. The project script builds
  the `Contents/...` structure itself.
- **Gotcha:** Finder launches apps with an arbitrary CWD, so the bundle's
  `CFBundleExecutable` is a tiny launcher that executes `markm-bin` with
  `--path="$APPDIR"` to keep `resources.neu` lookup CWD-independent.

## 2026-07-09 — Zoom leaves toolbar out of the document transform

- **Decision:** the document zoom transform applies to the workspace only. The
  toolbar/chrome is fixed-size and is not inside the transformed document
  surface.
- **Implementation:** `applyZoom` targets `#zoom-surface` inside `.workspace`,
  not the Svelte mount root. The surface keeps the existing WebKitGTK-compatible
  `transform: scale()` + inverse width/height trick, but its height is relative
  to the workspace (`%`), not the full viewport (`vh`), because the toolbar now
  lives outside the scaled surface.
- **Regression guard:** do not move the zoom transform back to `#app`; that
  reintroduces uncontrolled toolbar scaling and the CodeMirror
  transformed-ancestor trap at the app root.

## 2026-07-05 — Prose typography, refresh-pulse polish, per-file scroll memory

- **Markdown restyle → Tailwind `prose`-derived typography.** The old look was
  github-markdown-css (which Jan disliked). Replaced with the `prose` type scale +
  vertical rhythm (h1 2.25em/800, h2 1.5em, em-relative margins, 1.75 line-height),
  recolored through the theme vars. Dropped GitHub-isms: heading underlines and
  boxed table cells (now header rule + row dividers). Chosen over Tufte/serif after
  a websearch + a direction pick.
- **Refresh pulse polish.** Longer (3.2s) and it no longer fades to nothing — a
  changed block settles into a **persistent, theme-aware tint** (lighter wash in
  dark mode, darker in light) that marks it until the next change. Driven by
  `--pulse-persist-bg`, keyed off a new `data-mode` (light/dark) on `<html>` set by
  `applyTheme`. Pulse fires only when `pulseTick` (bumped on external reload)
  advances, so live typing never pulses.
- **Per-file scroll memory.** `Preview.svelte` stores scroll as a **ratio** (per
  file path, via `saveSetting('scroll:<path>')`) so it survives reflow from a
  different width/font, and restores only when the file changes (guarded by
  `restoredKey`) — content edits/auto-refresh don't yank the view.

## 2026-07-05 — Content fills window; reading font auto-scales with width

- Dropped the `.markdown-body` `max-width: 820px; margin: 0 auto` centered column
  so the rendered content **fills the window and grows with it** (no letter-boxed
  side margins).
- **Readability via font auto-scale, not a window cap.** First attempt capped the
  window width (`maxWidth`) — rejected because it (a) forbade fullscreen and (b)
  hit a GTK trap (below). Final approach: the window resizes freely (fullscreen
  allowed) and `Preview.svelte` **grows the reading font once the pane exceeds
  `BASE_PANE` (932px)** via a `ResizeObserver`, keeping chars-per-line roughly
  constant. `--reading-font` = `clamp(17px … 40px)` scaled by pane width. Measures
  the **pane** (not the viewport) so it's correct in split mode / with the sidebar,
  and measuring in layout px cancels the zoom transform. Default window width 1100
  → **960**.
- **GTK GOTCHA (from the abandoned cap):** setting `maxWidth` WITHOUT `maxHeight`
  locks the window from resizing on **both** axes — GTK geometry hints treat a
  missing `max_height` as 0. If you ever set `maxWidth`, you MUST also send a large
  `maxHeight`. (Now moot since we don't cap, but keep in mind for any future
  window-size constraint.)
- Welcome doc now lists the full shortcut set incl. **Esc** (close in View mode)
  and zoom keys.

## 2026-07-05 — Clickable links, directory-launch picker, Esc-to-close

- **Clickable preview links.** A bare `<a>` in the webview would navigate the
  WebKit view itself (blanking the app), so `Preview.svelte` delegates anchor
  clicks up to `App.onLink()` with `preventDefault`. Routing: http(s)/mailto/tel
  → system browser (`os.open`); `#anchor` → in-page `scrollIntoView`; a local
  `.md` → open in the viewer; any other local target → OS default handler.
  Relative/`file://` targets are resolved against the open file's dir and
  `.`/`..`-normalised in JS (no fs access).
- **Directory argument opens a picker.** `markm .` / `markm /tmp` (or a folder
  via a file manager) now shows `Chooser.svelte` — a full-pane list of the
  markdown files in that dir with **type-to-filter** (Enter opens the top match)
  and a **sort toggle: Modified (default, newest-first) / Name**. Launch handling
  stats the arg (`pathStat`) to branch dir-vs-file; `listMarkdownFilesWithStats`
  stats each entry for the modified-time sort. Opening the chooser also primes the
  folder sidebar.
- **Wrapper resolves relative path args.** Because the launcher detaches (no shared
  CWD), the wrapper now `realpath`s any existing non-flag arg to absolute before
  handing it to the binary — so `.` resolves against the *shell's* CWD, not the
  app's.
- **Esc.** Closes the picker if open; else quits, but only in read-only View mode
  (never in Edit/Split/Diff, so a stray Esc can't discard work).

## 2026-07-05 — Git Changes view, live auto-refresh, reading font, console detach

- **Git "Changes" view** (task #12): word-level diff of the working buffer vs the
  file at HEAD, tracked-changes style (`<ins>` highlight / `<del>` strikethrough),
  in `DiffView.svelte` using jsdiff `diffWords`. The **Changes** mode button only
  appears when the open file is git-tracked (`gitIsTracked`); `diff` is a transient
  mode (not persisted as a startup mode). Git helpers run through `os.execCommand`
  (`git -C <dir> …`) in `neu.js` (`gitIsTracked`, `gitHeadContent`).
- **Live auto-refresh on external change.** `watchFile()` (neu.js) wraps Neutralino's
  `filesystem.createWatcher` — it watches the file's *directory* (Neutralino watches
  dirs, not single files) and filters `watchFile` events by basename. On a match we
  reload from disk, but only when the buffer is **not dirty** (never clobber unsaved
  edits) and only pulse when the bytes **actually changed** (so our own saves stay
  silent — a save fires the watcher too). Visual cue: an accent line sweeps the top
  of the workspace + a fading "updated" pill by the filename (`.reloaded` class,
  auto-clears via a 1.1s timer).
- **Reading font selector.** New `fonts.js` catalog (System / Sans / Serif / Mono) →
  `--body-font` CSS var on `<html>`, applied to `.markdown-body`. Persisted like the
  theme. Stacks list several concrete faces before a generic fallback — no bundled
  webfonts (WebKitGTK only has system fonts). Font tunes the *preview*; the editor and
  diff stay mono (they're source).
- **Rendering spacing opened up** per feedback ("too little spacing"): body line-height
  1.65→1.8, font 16→17px, measure 860→820px, bigger paragraph/heading/list/blockquote
  margins, preview padding 32/40→44/56.
- **Console launcher now detaches by default.** The `~/.local/bin/markm` wrapper runs
  the binary under `setsid … &` + `disown` so `markm file.md` frees the shell prompt
  and closing the shell won't kill the viewer (verified: launched process becomes its
  own session leader, SID==PID, reparented off the wrapper). `--fg`/`--foreground` (or
  `MARKM_FG=1`) keeps it attached. Only the console wrapper changed — the `.desktop`
  Exec points straight at the binary and never held a terminal. Wrapper is generated
  with `printf '%q'` for the APPDIR line + a quoted (`<<'EOF'`) heredoc body so runtime
  `$@`/arrays aren't expanded at install time.

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
  extension). Ctrl +/- zoom must use `transform: scale()` on the workspace zoom
  surface with an inverse `width`/`height` (`100/z %`) so content reflows.
  Toolbar/chrome stays fixed-size. See `applyZoom` in `src/App.svelte`.
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
