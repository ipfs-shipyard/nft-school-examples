import os
import tensorflow as tf
import tensorflow_hub as hub
os.environ['TFHUB_MODEL_LOAD_FORMAT'] = 'COMPRESSED'

import numpy as np
import re, base64
from io import BytesIO
import PIL.Image
from PIL import Image
from flask import Flask, request, send_file
from flask_cors import CORS

#Download model from https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256 and edit local path below
tfhub_nst_model_path = ''

class nst:
    def __init__(self) -> None:
        self.hub_model = hub.load(tfhub_nst_model_path)
	
    def tensor_to_image(self, tensor):
        tensor = tensor*255
        tensor = np.array(tensor, dtype=np.uint8)
        if np.ndim(tensor)>3:
            assert tensor.shape[0] == 1
            tensor = tensor[0]
        return PIL.Image.fromarray(tensor)  

    def load_img(self, img):
        max_dim = 512
        img = re.sub(r'data:image/jpeg;base64,', "", img)
        img = Image.open(BytesIO(base64.b64decode(img, ' /')))
        img = np.array(img)

        img = tf.image.convert_image_dtype(img, tf.float32)
        shape = tf.cast(tf.shape(img)[:-1], tf.float32)
        long_dim = max(shape)
        scale = max_dim / long_dim

        new_shape = tf.cast(shape * scale, tf.int32)

        img = tf.image.resize(img, new_shape)
        img = img[tf.newaxis, :]
        return img

    def take_input_images(self):
        self.content_path = input('Enter content path: ')
        self.style_path = input('Enter style path: ')
        self.content_image = nst.load_img(self.content_path)
        self.style_image = nst.load_img(self.style_path)

    def generate_stylised_image(self):
        self.stylized_image = self.hub_model(tf.constant(self.content_image), tf.constant(self.style_image))[0]
        return self.tensor_to_image(self.stylized_image)
    
    def get_nst_image(self, img1, img2):
        self.content_image = self.load_img(img1)
        self.style_image = self.load_img(img2)
        final_img = self.generate_stylised_image()
        pil_img = Image.fromarray(np.uint8(final_img)).convert('RGB')
        im_file = BytesIO()
        pil_img.save(im_file, format="jpeg")
        im_file.seek(0)
        return send_file(im_file, mimetype='image/jpeg', as_attachment=True, attachment_filename='test.jpeg')

app = Flask(__name__)
CORS(app, resources={r'/*': {'origins': '*'}})

@app.route('/', methods=["POST"])
def api_call():
    img1 = request.get_json()['img1']
    img2 = request.get_json()["img2"]
    return nst_obj.get_nst_image(img1, img2)

if __name__ == "__main__":
    nst_obj = nst()
    app.run(host = "0.0.0.0", port=5000, debug=True)