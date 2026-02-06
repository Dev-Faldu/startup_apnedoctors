import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import os

model = tf.keras.models.load_model("cat_dog_basic.h5")

img_path = r"D:\startup_apnedoctors\archive\Test\dog.jpg"

if not os.path.exists(img_path):
    raise FileNotFoundError("Image not found")

img = image.load_img(img_path, target_size=(128,128))
img_array = image.img_to_array(img) / 255.0
img_array = np.expand_dims(img_array, axis=0)

pred = model.predict(img_array)[0][0]

if pred > 0.5:
    print("DOG ")
    print("Confidence:", pred)
else:
    print("CAT ")
    print("Confidence:", 1 - pred)
