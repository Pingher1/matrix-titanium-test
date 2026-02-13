from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder():
    # Create a 500x500 image with transparent background
    img = Image.new('RGBA', (500, 500), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    
    # Draw a cyan circle/outline to act as the "Texas" shape
    d.ellipse([(50, 50), (450, 450)], outline=(0, 255, 255), width=10)
    
    # Draw simple text "TEXAS" in the middle
    # Using default font since we might not have others
    # d.text((200, 240), "TEXAS", fill=(0, 255, 255)) 
    
    # Save directly to the destination
    dest = "/Users/philliprichardson/Documents/Matrix_Keanu/src/assets/trt_texas_logo.png"
    img.save(dest)
    print(f"Created placeholder at {dest}")

if __name__ == "__main__":
    create_placeholder()
