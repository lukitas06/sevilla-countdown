#!/usr/bin/env bash
# Copy the Scriptable scripts + confetti lib into Scriptable's iCloud folder so
# they sync to your iPhone. Run after editing:  ./sync-to-scriptable.sh
#
# Requires: Scriptable installed on an iPhone/iPad signed into the SAME iCloud
# account (that's what creates the destination folder). Editing here + syncing
# keeps git as the source of truth.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$HOME/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents"

if [ ! -d "$DEST" ]; then
  echo "✗ Scriptable's iCloud folder not found:"
  echo "  $DEST"
  echo
  echo "  Install Scriptable on your iPhone (same iCloud account) and open it"
  echo "  once so it creates that folder — then re-run this script."
  exit 1
fi

# The files Scriptable needs (scripts + the offline confetti lib).
FILES=(
  "SevillaConfig.js"
  "SevillaCore.js"
  "Sevilla Widget.js"
  "Sevilla Notifications.js"
  "Sevilla Setup.js"
  "_confetti.min.js"
)

for f in "${FILES[@]}"; do
  cp "$REPO/$f" "$DEST/$f"
  echo "→ synced: $f"
done

echo
echo "✓ Synced ${#FILES[@]} files to Scriptable. Give iCloud a few seconds, then"
echo "  open Scriptable on your iPhone and run 'Sevilla Setup'."
