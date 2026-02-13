from PIL import Image
import base64
from io import BytesIO

source_path = "/Users/philliprichardson/Documents/Matrix_Keanu/src/assets/test_origin.tif"
png_dest = "/Users/philliprichardson/Documents/Matrix_Keanu/src/assets/test_converted.png"
svg_dest = "/Users/philliprichardson/Documents/Matrix_Keanu/src/assets/test_converted.svg"

try:
    # 1. Open TIFF
    img = Image.open(source_path)
    # Convert CMYK to RGB for web compatibility
    if img.mode == 'CMYK':
        img = img.convert('RGB')
    
    # 2. Save as PNG
    img.save(png_dest, format='PNG')
    print(f"Created PNG: {png_dest}")

    # 3. Save as SVG (Embedded Base64)
    # This tests if the SVG container works even if it holds raster data
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    with open(svg_dest, "w") as f:
        f.write(f'''<svg xmlns="http://www.w3.org/2000/svg" width="{img.width}" height="{img.height}">
  <image href="data:image/png;base64,{img_str}" width="{img.width}" height="{img.height}"/>
</svg>''')
    print(f"Created SVG: {svg_dest}")

except Exception as e:
    print(f"Error: {e}")
