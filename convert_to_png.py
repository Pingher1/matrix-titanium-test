from PIL import Image
import sys
import os

def convert_to_png(source_path, dest_path):
    try:
        img = Image.open(source_path)
        img.save(dest_path, 'PNG')
        print(f"✅ Converted {source_path} -> {dest_path}")
        os.remove(source_path)
        print(f"🗑️ Removed source {source_path}")
    except Exception as e:
        print(f"❌ Error converting {source_path}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_to_png.py <source> <dest>")
        sys.exit(1)
    
    convert_to_png(sys.argv[1], sys.argv[2])
