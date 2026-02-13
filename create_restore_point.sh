#!/bin/bash
echo "Initiating Grade-A System Restore..."

# Create Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="src/backups/restore_point_golden_master_$TIMESTAMP"

# Create Directory
mkdir -p "$BACKUP_DIR"

# Copy Critical Assets
echo "Backing up Core Systems to $BACKUP_DIR..."
cp -r src "$BACKUP_DIR/"
cp -r public "$BACKUP_DIR/"
cp index.html "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp vite.config.js "$BACKUP_DIR/"

echo "✅ System Restore Point Created Successfully."
echo "Location: $BACKUP_DIR"
ls -la "$BACKUP_DIR"
