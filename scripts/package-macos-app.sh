#!/usr/bin/env bash
# Build a Finder-friendly macOS .app bundle around Neutralino's macOS binary.
# Run on macOS: Linux can produce the web bundle, but iconutil/sips and Finder
# bundle behavior are macOS-specific.
set -euo pipefail

REPO_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$REPO_DIR"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "macOS .app packaging must run on macOS." >&2
  exit 1
fi

for cmd in pnpm sips iconutil; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
done

ARCH="${1:-universal}"
case "$ARCH" in
  universal) MAC_BIN="markm-mac_universal" ;;
  arm64)     MAC_BIN="markm-mac_arm64" ;;
  x64)       MAC_BIN="markm-mac_x64" ;;
  *) echo "Usage: $0 [universal|arm64|x64]" >&2; exit 1 ;;
esac

pnpm build
pnpm exec neu build --release

DIST_DIR="$REPO_DIR/dist/markm"
if [[ ! -f "$DIST_DIR/$MAC_BIN" || ! -f "$DIST_DIR/resources.neu" ]]; then
  echo "Neutralino macOS build output not found: $DIST_DIR/$MAC_BIN + resources.neu" >&2
  exit 1
fi

TMP_DIR="$REPO_DIR/.tmp/macos"
ICONSET="$TMP_DIR/appIcon.iconset"
ICNS="$TMP_DIR/appIcon.icns"
APP_DIR="$REPO_DIR/dist/macos/markm.app"
CONTENTS="$APP_DIR/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

rm -rf "$TMP_DIR" "$APP_DIR"
mkdir -p "$ICONSET" "$MACOS" "$RESOURCES"

ICON_SRC="$REPO_DIR/public/icons/appIcon.png"
for spec in \
  "16 icon_16x16.png" \
  "32 icon_16x16@2x.png" \
  "32 icon_32x32.png" \
  "64 icon_32x32@2x.png" \
  "128 icon_128x128.png" \
  "256 icon_128x128@2x.png" \
  "256 icon_256x256.png" \
  "512 icon_256x256@2x.png" \
  "512 icon_512x512.png" \
  "1024 icon_512x512@2x.png"; do
  set -- $spec
  sips -z "$1" "$1" "$ICON_SRC" --out "$ICONSET/$2" >/dev/null
done
iconutil -c icns "$ICONSET" -o "$ICNS"

install -m755 "$DIST_DIR/$MAC_BIN" "$MACOS/markm-bin"
install -m644 "$DIST_DIR/resources.neu" "$MACOS/resources.neu"
install -m644 "$ICNS" "$RESOURCES/appIcon.icns"
install -m644 "$REPO_DIR/macos/Info.plist.in" "$CONTENTS/Info.plist"

# Neutralino's production binary resolves resources.neu from CWD unless --path
# is passed. Finder launches apps from an arbitrary CWD, so the bundle executable
# is a tiny launcher that points the native binary at Contents/MacOS.
cat > "$MACOS/markm" <<'EOF'
#!/usr/bin/env bash
APPDIR=$(cd "$(dirname "$0")" && pwd)
exec "$APPDIR/markm-bin" --path="$APPDIR" "$@"
EOF
chmod 755 "$MACOS/markm"

echo "Built $APP_DIR"
echo "Run: open $APP_DIR"
