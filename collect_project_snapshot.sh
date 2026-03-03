#!/usr/bin/env bash

# collect_project_snapshot.sh
# Usage: ./collect_project_snapshot.sh /path/to/project [--include-node-modules]
# Produces: /tmp/project_snapshot_<timestamp>.tgz (redacts potential secrets in .env files)

set -euo pipefail

PROJECT_DIR="${1:-.}"
INCLUDE_NODE_MODULES=false

if [ "${2:-}" = "--include-node-modules" ]; then
  INCLUDE_NODE_MODULES=true
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUT_DIR="/tmp/project_snapshot_${TIMESTAMP}"
OUT_TGZ="/tmp/project_snapshot_${TIMESTAMP}.tgz"

mkdir -p "$OUT_DIR"
echo "Collecting project snapshot for: $PROJECT_DIR"
echo "Output directory: $OUT_DIR"

# Basic environment info
{
  echo "snapshot_generated: $TIMESTAMP"
  echo "host: $(hostname -f 2>/dev/null || hostname)"
  echo "cwd: $(realpath "$PROJECT_DIR")"
  echo "user: $(whoami)"
  echo "date: $(date --iso-8601=seconds 2>/dev/null || date)"
  echo ""
  echo "node_version: $(node -v 2>/dev/null || echo 'node not found')"
  echo "npm_version: $(npm -v 2>/dev/null || echo 'npm not found')"
  echo "yarn_version: $(yarn -v 2>/dev/null || echo 'yarn not found')"
} > "$OUT_DIR/env_info.txt"

# Git info (if repo)
if [ -d "$PROJECT_DIR/.git" ]; then
  (
    cd "$PROJECT_DIR"
    git rev-parse --show-toplevel 2>/dev/null || true
    echo "git_head: $(git rev-parse HEAD 2>/dev/null || echo 'n/a')"
    echo "git_branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'n/a')"
    echo "git_status_porcelain:"
    git status --porcelain || true
    echo ""
    echo "last_10_commits:"
    git --no-pager log -n 10 --pretty=format:"%H | %an | %ad | %s" --date=iso 2>/dev/null || true
  ) > "$OUT_DIR/git_info.txt"
else
  echo "no_git_repo" > "$OUT_DIR/git_info.txt"
fi

# Project size summary (top directories)
du -sh "$PROJECT_DIR"/* 2>/dev/null | sort -h | head -n 50 > "$OUT_DIR/du_top.txt" || true

# List important files and tree (depth 3)
( cd "$PROJECT_DIR" && find . -maxdepth 3 -type d -printf "%p\n" | sed 's|^\./||' ) > "$OUT_DIR/tree_dirs_depth3.txt"

# Find package.json files and copy them (redact sensitive fields)
find "$PROJECT_DIR" -name "package.json" -maxdepth 5 -print0 | while IFS= read -r -d '' pkg; do
  dest="$OUT_DIR/$(realpath --relative-to="$PROJECT_DIR" "$pkg")"
  mkdir -p "$(dirname "$dest")"
  # copy and also create a cleaned version
  cp "$pkg" "$dest"
  # make a redacted copy
  jq 'del(.private, .scripts["postinstall"], .scripts["preinstall"])' "$pkg" > "${dest}.clean.json" 2>/dev/null || cp "$pkg" "${dest}.clean.json"
done

# Copy README and top-level manifests if present
for f in README.md README.txt README || true; do
  if [ -f "$PROJECT_DIR/$f" ]; then
    cp "$PROJECT_DIR/$f" "$OUT_DIR/"
  fi
done

# Grab .env files but redact values (only include var names)
for ef in "$PROJECT_DIR"/.env*; do
  if [ -f "$ef" ]; then
    base=$(basename "$ef")
    awk -F '=' 'BEGIN{IGNORECASE=1} /^[A-Za-z0-9_]+=/{ split($0,a,"="); printf("%s=<REDACTED>\n", a[1]); next } {print}' "$ef" > "$OUT_DIR/$base.redacted"
  fi
done

# Copy NOTES.md or any *NOTE* files developer said they'd drop
if [ -f "$PROJECT_DIR/NOTES.md" ]; then
  cp "$PROJECT_DIR/NOTES.md" "$OUT_DIR/NOTES.md"
fi

# Also copy any file named DEVNOTES.txt or devnotes.md
for f in "$PROJECT_DIR"/devnotes* "$PROJECT_DIR"/DEVNOTES*; do
  if [ -f "$f" ]; then
    cp "$f" "$OUT_DIR/$(basename "$f")"
  fi
done

# Capture small samples of key files (first 200 lines) to inspect quickly
SAMPLE_FILES=("server/src/index.ts" "server/src/index.js" "client/package.json" "server/package.json" "client/src/App.tsx" "client/src/main.tsx")
for sf in "${SAMPLE_FILES[@]}"; do
  if [ -f "$PROJECT_DIR/$sf" ]; then
    mkdir -p "$(dirname "$OUT_DIR/$sf")"
    head -n 200 "$PROJECT_DIR/$sf" > "$OUT_DIR/$sf.sample"
  fi
done

# Optional: package-lock / yarn.lock presence
[ -f "$PROJECT_DIR/yarn.lock" ] && cp "$PROJECT_DIR/yarn.lock" "$OUT_DIR/"
[ -f "$PROJECT_DIR/package-lock.json" ] && cp "$PROJECT_DIR/package-lock.json" "$OUT_DIR/"

# Package the project snapshot (excluding node_modules by default)
(
  cd "$PROJECT_DIR"
  TAR_EXCLUDES=()
  if [ "$INCLUDE_NODE_MODULES" = false ]; then
    TAR_EXCLUDES+=(--exclude='node_modules' --exclude='**/node_modules')
  fi
  # use tar to create archive from the snapshot directory (not full project to keep size small)
  tar -czf "$OUT_TGZ" -C "$OUT_DIR" .
)

# Compute checksum
if command -v shasum >/dev/null 2>&1; then
  SHA=$(shasum -a 256 "$OUT_TGZ" | awk '{print $1}')
elif command -v sha256sum >/dev/null 2>&1; then
  SHA=$(sha256sum "$OUT_TGZ" | awk '{print $1}')
else
  SHA="(sha256 unavailable)"
fi

echo ""
echo "Snapshot created: $OUT_TGZ"
echo "SHA256: $SHA"
echo ""
echo "Next steps:"
echo " - Upload $OUT_TGZ to your secure file share or paste a link here."
echo " - Or, open the archive and paste the content of env_info.txt, git_info.txt and NOTES.md (if present) here."
echo ""
echo "Security note: this script redacts .env values and does not include full node_modules by default."
echo "If you need a deeper snapshot (include node_modules), re-run with --include-node-modules flag."
exit 0
