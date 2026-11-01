#!/usr/bin/env sh
# The Gilded Code - local preview for macOS and Linux.
# Requires Python 3 (already installed on most macOS and Linux systems).
cd "$(dirname "$0")" || exit 1

PORT=8000
URL="http://localhost:$PORT/"

if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo ""
  echo "Python 3 was not found."
  echo "Install it from https://www.python.org/downloads/ and run this file again,"
  echo "or upload this folder to a static host and share the link instead."
  echo ""
  exit 1
fi

echo ""
echo "  THE GILDED CODE - local preview"
echo "  Running at $URL"
echo "  Keep this window open while you browse. Press Ctrl+C to stop."
echo ""

( sleep 1; open "$URL" 2>/dev/null || xdg-open "$URL" 2>/dev/null || true ) &
exec "$PY" -m http.server "$PORT"
