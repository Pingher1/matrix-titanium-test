#!/usr/bin/env bash
# generate_git_patch.sh
# Usage:
# ./generate_git_patch.sh [NUM_COMMITS] # create format-patch for last N commits (default 5)
# ./generate_git_patch.sh --diff # create a patch of uncommitted changes (changes.diff)
set -euo pipefail

NUM=${1:-5}

OUTDIR="./git-patches-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTDIR"

if [ "${1:-}" = "--diff" ]; then
 echo "Creating uncommitted-changes patch..."
 git diff > "$OUTDIR/changes.diff"
 echo "Wrote $OUTDIR/changes.diff"
else
 echo "Creating git-format-patch for last $NUM commits..."
 git format-patch -$NUM -o "$OUTDIR"
 echo "Wrote patches to $OUTDIR"
fi

# create tarball
tar -czf "${OUTDIR}.tgz" -C "$(dirname "$OUTDIR")" "$(basename "$OUTDIR")"
echo "Created archive: ${OUTDIR}.tgz"
sha256sum "${OUTDIR}.tgz" | awk '{print "SHA256: "$1}'
