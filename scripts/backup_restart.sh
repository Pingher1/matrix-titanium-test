#!/usr/bin/env bash
set -euo pipefail

TS=$(date +%Y%m%d_%H%M%S)
BRANCH="snapshot_phase27_${TS}"
ARCH="kronos_snapshot_${TS}.tar.gz"
BACKUP_DIR="$HOME/.kronos_env_backup"

echo "Backing up .env files to $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
[ -f ".env" ] && cp .env "$BACKUP_DIR/.env.$TS" || true
[ -f ".env.local" ] && cp .env.local "$BACKUP_DIR/.env.local.$TS" || true

echo "Creating git branch $BRANCH and committing current state"
git checkout -b "$BRANCH"
git add -A
git commit -m "snapshot before restart: $BRANCH" || echo "No changes to commit"
# Push logic removed to prevent macOS permissions crashes. Manual push requested.
# git push -u origin "$BRANCH"

echo "Creating archive (excluding node_modules and .git)"
tar --exclude='node_modules' --exclude='.git' -czf "$ARCH" .
mv "$ARCH" "$BACKUP_DIR/"

echo "Restarting dev server with TMPDIR workaround..."
# Kill any existing stray node instances running the backend process to prevent port collisions
kill -9 $(lsof -t -i:8080) 2>/dev/null || true

TMPDIR=$(mktemp -d)
TMPDIR=$TMPDIR npm run dev &
echo "Backup & restart complete. Archives safely stored in $BACKUP_DIR"
