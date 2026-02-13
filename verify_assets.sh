#!/bin/bash
echo "🔍 GOD MODE: Verifying Connectivity..."

# 1. Check Ports
lsof -i :3000 -t >/dev/null && echo "✅ KRONOS Active (Port 3000)" || echo "❌ KRONOS Offline (Port 3000)"
lsof -i :4000 -t >/dev/null && echo "✅ JEHOVAH (Adversary) Active (Port 4000)" || echo "❌ JEHOVAH Offline (Port 4000)"

# 2. Check Asset Index
if [ -f "public/assets/asset_manifest.json" ]; then
    echo "✅ Asset Index Found at public/assets/asset_manifest.json"
    # Optional: Display content count
    echo "   - Content: $(cat public/assets/asset_manifest.json | tr '\n' ' ')"
else
    echo "⚠️ ALERT: Index Missing. Rebuilding..."
    # Simple rebuild logic (can be expanded)
    ls public/assets > public/assets/asset_manifest.json
    echo "   - Rebuilt Index."
fi

# 3. Permission Sweep
chmod -R 755 public/assets
echo "✅ Permissions Normalized (Zone A: 755)."
