#!/bin/bash
TARGET="/Users/philliprichardson/Documents/Kronos_Backup/Matrix_Recovery_file2"

echo "Initiating Off-Site Recovery Protocol..."
echo "Target: $TARGET"

# Create Target Directory
mkdir -p "$TARGET"

# Copy Assets
echo "Transferring Golden Master Assets..."
cp -r src public index.html package.json vite.config.js "$TARGET/"

echo "✅ Off-Site Backup Complete."
echo "Location: $TARGET"
ls -la "$TARGET"
