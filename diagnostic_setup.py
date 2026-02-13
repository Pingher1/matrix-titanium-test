import shutil
import os

# Define External Sources (We know these exist from previous `list_dir`)
src_tiff = "/Users/philliprichardson/Documents/LOGOS/PRINT READY RICHARDSON LOGOS/TheRichardsonTeam_Logo_CMYK-01.tif"
src_png  = "/Users/philliprichardson/Documents/The-Richardson-Team-Website/trt-rope-logo.png"
src_svg  = "/Users/philliprichardson/Documents/LOGOS/PRINT READY RICHARDSON LOGOS/TheRichardsonTeam_Logo_VECTOR.svg"

# Define Internal Destinations
dst_dir = "/Users/philliprichardson/Documents/Matrix_Keanu/src/assets/"
dst_tiff = dst_dir + "test_internal.tif"
dst_png  = dst_dir + "test_internal.png"
dst_svg  = dst_dir + "test_internal.svg"

# Perform Copy
try:
    print("--- Copying Files ---")
    shutil.copy2(src_tiff, dst_tiff)
    print(f"TIFF: Copied to {dst_tiff}")
    
    shutil.copy2(src_png, dst_png)
    print(f"PNG:  Copied to {dst_png}")
    
    shutil.copy2(src_svg, dst_svg)
    print(f"SVG:  Copied to {dst_svg}")
    
    # Verify
    print("\n--- Verification ---")
    print(f"TIFF Size: {os.path.getsize(dst_tiff)} bytes")
    print(f"PNG  Size: {os.path.getsize(dst_png)} bytes")
    print(f"SVG  Size: {os.path.getsize(dst_svg)} bytes")

except Exception as e:
    print(f"CRITICAL FAILURE: {e}")
