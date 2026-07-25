#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
VERSION="$(node -e "console.log(require('$ROOT_DIR/package.json').version)")"
ARCHIVE_NAME="gestaltview-agent-trainer-v${VERSION}.zip"
ARCHIVE_PATH="$DIST_DIR/$ARCHIVE_NAME"

mkdir -p "$DIST_DIR"
rm -f "$ARCHIVE_PATH"

cd "$ROOT_DIR"

if ! command -v zip >/dev/null 2>&1; then
  echo "zip is required to package the kit."
  exit 1
fi

zip -qr "$ARCHIVE_PATH" . \
  -x "node_modules/*" \
  -x "dist/*" \
  -x ".env*" \
  -x "*.zip" \
  -x ".DS_Store" \
  -x "coverage/*" \
  -x "CODEX_PROMPT.md" \
  -x "CurrentState.md" \
  -x "SPEC.md"

echo "Created $ARCHIVE_PATH"
