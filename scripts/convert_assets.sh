#!/usr/bin/env bash
set -euo pipefail

SRC_DIR=public/assets/textures
OUT_DIR=public/assets/ktx2

mkdir -p "$OUT_DIR"

for f in "$SRC_DIR"/*.{png,jpg,jpeg}; do
    [ -f "$f" ] || continue
    base=$(basename "$f")
    out="$OUT_DIR/${base%.*}.ktx2"
    echo "Converting $f -> $out"
    toktx --target_type UASTC --encode "$out" "$f"
done
