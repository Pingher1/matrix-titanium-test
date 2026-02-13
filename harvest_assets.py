import requests
from PIL import Image
from io import BytesIO
import os

# URLs from scouting mission
doll_urls = [
    "https://images.mattel.net/images/w_360,c_scale,f_auto/shop-us-prod/files/ysqmhklawgcljbxj1xrv/barbie-fashionistas-doll-in-denim-butterfly-dress-with-pink-belt-purple-hair-hyt89.jpg",
    "https://images.mattel.net/images/w_360,c_scale,f_auto/shop-us-prod/files/saalhielgkhbjskzxoox/barbie-fashionistas-doll-in-metallic-pink-minidress-blond-hair-hyt88.jpg",
    "https://images.mattel.net/images/w_360,c_scale,f_auto/shop-us-prod/files/ir0zo6wn18l6wycyeirz/barbie-fashionistas-doll-in-checkered-flower-midi-dress-black-hair-hyt91.jpg"
]

# Destination directory (Vite public assets)
dest_dir = "public/assets"
os.makedirs(dest_dir, exist_ok=True)

def harvest_and_sanitize(urls):
    print(f"🎀 Starting Harvest: {len(urls)} targets identified.")
    
    for i, url in enumerate(urls):
        try:
            print(f"⬇️ Downloading Target {i+1}...")
            response = requests.get(url)
            response.raise_for_status()
            
            # Open image from memory
            img = Image.open(BytesIO(response.content))
            
            # Convert to RGB (remove CMYK if present - Marshall Law)
            if img.mode == 'CMYK':
                img = img.convert('RGB')
            
            # Construct filename
            filename = f"barbie_doll_{i+1}.png"
            filepath = os.path.join(dest_dir, filename)
            
            # Save as PNG
            img.save(filepath, format='PNG')
            print(f"✅ Sanitized & Deployed: {filepath}")
            
        except Exception as e:
            print(f"❌ Mission Failure for Target {i+1}: {e}")

if __name__ == "__main__":
    harvest_and_sanitize(doll_urls)
