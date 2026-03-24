"""
Flask API — Fake Image Detection Model Inference
=================================================
Endpoint: POST /predict
Input   : multipart/form-data with field "image"
Output  : { "prediction": "FAKE"|"REAL", "confidence": 0.xx }

Run:
    python app.py
or production:
    gunicorn -w 2 -b 0.0.0.0:5001 app:app
"""

import os
import io
import sys
import logging

import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from werkzeug.utils import secure_filename

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
IMG_HEIGHT   = 128
IMG_WIDTH    = 128
MODEL_PATH   = os.path.join(os.path.dirname(__file__), "..", "ml_model", "model", "fake_image_model.h5")
ALLOWED_EXTS = {"png", "jpg", "jpeg", "webp", "bmp", "tiff"}
MAX_FILE_MB  = 10

# ─── App Setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_MB * 1024 * 1024

# ─── Load Model ───────────────────────────────────────────────────────────────
model = None

def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        logger.warning(
            f"Model not found at {MODEL_PATH}. "
            "The /predict endpoint will return a demo response until the model is trained."
        )
        return
    logger.info(f"Loading model from {MODEL_PATH} …")
    model = tf.keras.models.load_model(MODEL_PATH)
    logger.info("Model loaded successfully.")

load_model()

# ─── Helpers ──────────────────────────────────────────────────────────────────
def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTS

def preprocess_image(file_bytes: bytes) -> np.ndarray:
    """Decode bytes → RGB → resize → normalize → batch dim."""
    nparr = np.frombuffer(file_bytes, np.uint8)
    img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image. Ensure it is a valid image file.")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_WIDTH, IMG_HEIGHT))
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)
    return img

# ─── Routes ───────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
    })

@app.route("/predict", methods=["POST"])
def predict():
    # ── 1. Validate request ──────────────────────────────────────────────────
    if "image" not in request.files:
        return jsonify({"error": "No image field in request. Send file as 'image'."}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTS)}"
        }), 400

    # ── 2. Read bytes ────────────────────────────────────────────────────────
    try:
        file_bytes = file.read()
    except Exception as e:
        logger.error(f"Failed to read file: {e}")
        return jsonify({"error": "Failed to read uploaded file."}), 500

    # ── 3. Demo response when model is not yet trained ───────────────────────
    if model is None:
        import random
        score = random.uniform(0.1, 0.95)
        demo_prediction = "FAKE" if score < 0.5 else "REAL"
        demo_confidence = round(1.0 - score if score < 0.5 else score, 4)
        logger.warning("Returning DEMO prediction — model not loaded.")
        return jsonify({
            "prediction": demo_prediction,
            "confidence": demo_confidence,
            "demo": True,
            "message": "Model not trained yet. This is a demo response.",
        })

    # ── 4. Preprocess ────────────────────────────────────────────────────────
    try:
        img_array = preprocess_image(file_bytes)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        return jsonify({"error": "Image preprocessing failed."}), 500

    # ── 5. Inference ─────────────────────────────────────────────────────────
    try:
        raw_score = float(model.predict(img_array, verbose=0)[0][0])
    except Exception as e:
        logger.error(f"Inference error: {e}")
        return jsonify({"error": "Model inference failed."}), 500

    # ── 6. Interpret results ─────────────────────────────────────────────────
    if raw_score >= 0.5:
        label      = "REAL"
        confidence = round(raw_score, 4)
    else:
        label      = "FAKE"
        confidence = round(1.0 - raw_score, 4)

    logger.info(
        f"Prediction: {label} | Confidence: {confidence:.4f} | "
        f"File: {secure_filename(file.filename)}"
    )

    return jsonify({
        "prediction": label,
        "confidence": confidence,
        "raw_score": round(raw_score, 4),
    })


@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": f"File too large. Maximum size is {MAX_FILE_MB} MB."}), 413

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error."}), 500


# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5001))
    logger.info(f"Starting Flask API on port {port} …")
    app.run(host="0.0.0.0", port=port, debug=False)
