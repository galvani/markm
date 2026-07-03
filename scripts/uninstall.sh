#!/usr/bin/env bash
# Remove a local markm install created by scripts/install.sh.
set -euo pipefail

PREFIX="${PREFIX:-$HOME/.local}"

rm -rf  "$PREFIX/share/markm"
rm -f   "$PREFIX/bin/markm"
rm -f   "$PREFIX/share/applications/markm.desktop"
rm -f   "$PREFIX/share/icons/hicolor/256x256/apps/markm.png"
rm -f   "$PREFIX/share/mime/packages/markm-markdown.xml"

update-mime-database "$PREFIX/share/mime" 2>/dev/null || true
update-desktop-database "$PREFIX/share/applications" 2>/dev/null || true
gtk-update-icon-cache -f -t "$PREFIX/share/icons/hicolor" 2>/dev/null || true

echo "Removed markm from $PREFIX."
echo "Note: if markm was the default markdown handler, pick a new one via"
echo "  xdg-mime default <other>.desktop text/markdown"
