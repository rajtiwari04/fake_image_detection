"""
predict.py - Standalone prediction utility
Usage: python predict.py --image path/to/image.jpg
"""

import argparse
import numpy as np
import cv2
import tensorflow as tf
import os

IMG_HEIGHT = 128
IMG_WIDTH  = 128
MODEL_PATH = "model/fake_image_model.h5"

def preprocess_image(image_path: str) -> np.ndarray:
    """Load and preprocess a single image for inference."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_WIDTH, IMG_HEIGHT))
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)   # shape: (1, H, W, 3)
    return img

def predict(image_path: str, model_path: str = MODEL_PATH) -> dict:
    """Return prediction dict: {prediction, confidence, raw_score}."""
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model not found at {model_path}. Please train the model first."
        )

    model = tf.keras.models.load_model(model_path)
    img = preprocess_image(image_path)

    raw_score = float(model.predict(img, verbose=0)[0][0])

    # Class mapping: sigmoid output → 1 = real, 0 = fake
    # Confidence = how certain the model is of its prediction
    if raw_score >= 0.5:
        label = "REAL"
        confidence = round(raw_score, 4)
    else:
        label = "FAKE"
        confidence = round(1.0 - raw_score, 4)

    return {
        "prediction": label,
        "confidence": confidence,
        "raw_score": round(raw_score, 4),
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fake Image Detector - Single Image")
    parser.add_argument("--image", required=True, help="Path to image file")
    parser.add_argument("--model", default=MODEL_PATH, help="Path to .h5 model file")
    args = parser.parse_args()

    result = predict(args.image, args.model)
    print(f"\nImage     : {args.image}")
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence'] * 100:.2f}%")
    print(f"Raw Score : {result['raw_score']}")
