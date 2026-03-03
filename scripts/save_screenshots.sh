#!/usr/bin/env bash
set -euo pipefail

SRC_DIR=${1:-"$HOME/Downloads"} # default source directory for images
DEST_DIR="screenshots"
BRANCH="feature/screenshots/phase24_$(date +%Y%m%d_%H%M%S)"

mkdir -p "$DEST_DIR"

# copy png/jpg files matching pattern from SRC_DIR (adjust pattern as needed)
count=0
for f in "$SRC_DIR"/*.{png,jpg,jpeg}; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  dest="${DEST_DIR}/${base%.*}_$(date +%Y%m%d_%H%M%S).${base##*.}"
  cp "$f" "$dest"
  echo "Copied $f -> $dest"
  count=$((count+1))
done

if [ $count -eq 0 ]; then
  echo "No screenshots found in $SRC_DIR. Searching Desktop as fallback..."
  for f in "$HOME/Desktop"/*.{png,jpg,jpeg}; do
    [ -e "$f" ] || continue
    base=$(basename "$f")
    dest="${DEST_DIR}/${base%.*}_$(date +%Y%m%d_%H%M%S).${base##*.}"
    cp "$f" "$dest"
    echo "Copied $f -> $dest"
    count=$((count+1))
  done
fi

if [ $count -eq 0 ]; then
  echo "No screenshots found in $SRC_DIR or Desktop."
  exit 0
fi

# create metadata
metafile="${DEST_DIR}/metadata_$(date +%Y%m%d_%H%M%S).json"
cat > "$metafile" <<JSON
{
  "timestamp":"$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "notes":"Phase24/25 Arc Reactor FX screenshots",
  "files": $(ls "$DEST_DIR" | jq -R -s -c 'split("\n")[:-1]')
}
JSON

# commit to a branch
git checkout -b "$BRANCH"
git add "$DEST_DIR"
git commit -m "chore(screenshots): add Arc Reactor FX screenshots ($BRANCH)"
echo "Committed $count screenshots to local branch $BRANCH"
# Manual Push required due to Sandbox
echo "Please run: git push -u origin $BRANCH"
