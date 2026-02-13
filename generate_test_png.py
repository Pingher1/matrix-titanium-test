from PIL import Image
# Create a 100x100 Red Square - The "Hello World" of images.
img = Image.new('RGB', (100, 100), color = (255, 0, 0))
img.save('/Users/philliprichardson/Documents/Matrix_Keanu/src/assets/system_test_red_square.png')
print("Created system_test_red_square.png")
