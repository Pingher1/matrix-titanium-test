#!/bin/bash

echo "=== KRONOS DEEP CLEAN INITIATED ==="

# 1. Purge Node Modules and Package Locks
echo "[1/4] Purging node_modules..."
rm -rf node_modules
rm -f package-lock.json

# 2. Clear Vite/Build Artifacts
echo "[2/4] Clearing Vite build artifacts and temp files..."
rm -rf dist
rm -rf .tmp
rm -rf .vite
rm -rf .eslintcache

# 3. Clear the locked Git Config files that bogged down the Vercel push
echo "[3/4] Purging broken Git locks..."
rm -f .git/config.lock
rm -f .git/index.lock

# 4. Generate the Map Cartography (requires 'tree' installed on Mac: 'brew install tree')
echo "[4/4] Generating Master Cartography map..."
tree -I "node_modules|dist|.git|.tmp" > kronos_directory_map.md

echo "=== CLEANUP COMPLETE ==="
echo "Run 'npm install' to cleanly reinstall your modules."
