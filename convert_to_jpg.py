from PIL import Image
import os

source_path = "/Users/philliprichardson/Documents/The-Richardson-Team-Website/trt-rope-logo.png"
dest_path = "/Users/philliprichardson/Documents/Matrix_Keanu/src/assets/trt_texas_logo.jpg"

try:
    img = Image.open(source_path)
    # Convert to RGB (JPEG doesn't support RGBA)
    # Create black background
    background = Image.new("RGB", img.size, (0, 0, 0))
    # Paste the image on top, using alpha channel as mask
    if img.mode == 'RGBA':
        background.paste(img, mask=img.split()[3])
    else:
        background.paste(img)
        
    background.save(dest_path, "JPEG", quality=90)
    print(f"Successfully converted to JPEG: {dest_path}")
    print(f"File size: {os.path.getsize(dest_path)} bytes")
except Exception as e:
    print(f"Error converting: {e}")
