import os
from PIL import Image

BASE = "archive/PetImages"

def clean(folder):
    for file in os.listdir(folder):
        path = os.path.join(folder, file)
        try:
            img = Image.open(path)
            img = img.convert("RGB")  # force 3 channels
            img.save(path)
        except:
            print("Removing:", path)
            os.remove(path)

for cls in ["Cat", "Dog"]:
    clean(os.path.join(BASE, cls))

print("Dataset cleaned successfully")
