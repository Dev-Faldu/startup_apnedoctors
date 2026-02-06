import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image

model = tf.keras.models.load_model("cat_dog_model.h5")

img_path = r"D:\startup_apnedoctors\archive\PetImages\Test\dog(1).jpg"

img = image.load_img(img_path, target_size=(128, 128))
img_array = image.img_to_array(img)
img_array = img_array / 255.0
img_array = np.expand_dims(img_array, axis=0)

prediction = model.predict(img_array)[0][0]

if prediction > 0.5:
    print("DOG ")
    print("Confidence:", prediction)
else:
    print("CAT")
    print("Confidence:", 1 - prediction)
