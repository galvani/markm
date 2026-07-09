# Build markm

## Mermaid support

Current builds are **without Mermaid support**. There is no Mermaid dependency,
renderer integration, or build flag in this repo yet, so these commands build
the plain markdown viewer/editor:

```bash
pnpm install
pnpm build
pnpm exec neu build --release
```

A Mermaid-enabled build is not available until the app adds Mermaid rendering
behind an explicit feature flag or separate build target. Do not use or document
a `WITH_MERMAID=1`-style command until the code actually supports it.

## macOS `.app`

To build a macOS app bundle, send the repo/archive to a Mac and run:

```bash
cd markm
corepack enable
pnpm install
pnpm run package:macos-app
open dist/macos/markm.app
```

This produces the current non-Mermaid app bundle.

Requirements:

- macOS
- Node.js
- `pnpm` via Corepack, or installed separately
- Internet access for `pnpm install` unless dependencies are already present

The app bundle is written to `dist/macos/markm.app`. It is unsigned and not
notarized, so Gatekeeper may block the first launch. If that happens, open it
from Finder with right-click -> Open and confirm.

Architecture-specific builds:

```bash
scripts/package-macos-app.sh arm64
scripts/package-macos-app.sh x64
scripts/package-macos-app.sh universal
```

`universal` is the default.

## Linux local install

```bash
pnpm install
pnpm build
pnpm exec neu build --release
scripts/install.sh
```

This installs under `~/.local`, registers the markdown MIME handler, and makes
`markm file.md` available if `~/.local/bin` is on `PATH`.
