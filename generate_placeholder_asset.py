from PIL import Image, ImageDraw

def create_placeholder(path):
    # Create black background
    img = Image.new('RGB', (800, 600), color='black')
    d = ImageDraw.Draw(img)
    
    # Draw simple matrix grid (green lines)
    for i in range(0, 800, 40):
        d.line([(i, 0), (i, 600)], fill=(0, 50, 0), width=1)
    for i in range(0, 600, 40):
        d.line([(0, i), (800, i)], fill=(0, 50, 0), width=1)
        
    # Draw text "SYSTEM FALLBACK"
    # (Handling text centered without font file is tricky, so just lines for now or text if default font works)
    d.text((10, 10), "SYSTEM FALLBACK - ASSET OFFLINE", fill=(0, 255, 65))
    
    img.save(path)
    print(f"Created {path}")

create_placeholder("public/assets/matrix_grid_placeholder.png")
