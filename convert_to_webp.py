from PIL import Image
import os

source_path = "/Users/philliprichardson/Documents/The-Richardson-Team-Website/trt-rope-logo.png"
dest_path = "/Users/philliprichardson/Documents/Matrix_Keanu/src/assets/trt_texas_logo.webp"

try:
    img = Image.open(source_path)
    img.save(dest_path, "WEBP")
    print(f"Successfully converted to WEBP: {dest_path}")
    print(f"File size: {os.path.getsize(dest_path)} bytes")
except Exception as e:
    print(f"Error converting: {e}")
