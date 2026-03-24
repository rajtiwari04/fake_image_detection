"""
Fake Image Detection - CNN Model Training Script
================================================
Trains a CNN to classify images as REAL or FAKE (deepfake/manipulated).

Dataset structure expected:
    dataset/
        train/
            real/   (real images)
            fake/   (fake/manipulated images)
        validation/
            real/
            fake/

Usage:
    python train_model.py
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
)
import matplotlib.pyplot as plt
import json

# ─── Configuration ────────────────────────────────────────────────────────────
IMG_HEIGHT = 128
IMG_WIDTH  = 128
BATCH_SIZE = 32
EPOCHS     = 30
LEARNING_RATE = 1e-4

TRAIN_DIR = "dataset/train"
VAL_DIR   = "dataset/test"
MODEL_SAVE_PATH = "model/fake_image_model.h5"
HISTORY_SAVE_PATH = "model/training_history.json"

os.makedirs("model", exist_ok=True)

# ─── Data Augmentation & Generators ───────────────────────────────────────────
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
    fill_mode="nearest",
)

val_datagen = ImageDataGenerator(rescale=1.0 / 255)

train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode="binary",   # 0 = fake, 1 = real
    shuffle=True,
)

val_generator = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False,
)

print(f"\nClass indices: {train_generator.class_indices}")
print(f"Train samples: {train_generator.samples}")
print(f"Val samples  : {val_generator.samples}\n")

# ─── CNN Model Architecture ───────────────────────────────────────────────────
def build_model(input_shape=(IMG_HEIGHT, IMG_WIDTH, 3)):
    model = models.Sequential([
        # Block 1
        layers.Conv2D(32, (3, 3), activation="relu", padding="same",
                      input_shape=input_shape),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # Block 2
        layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # Block 3
        layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.4),

        # Block 4
        layers.Conv2D(256, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.4),

        # Classifier Head
        layers.GlobalAveragePooling2D(),
        layers.Dense(512, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(256, activation="relu"),
        layers.Dropout(0.3),
        layers.Dense(1, activation="sigmoid"),  # Binary output
    ])
    return model


model = build_model()
model.summary()

# ─── Compile ──────────────────────────────────────────────────────────────────
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss="binary_crossentropy",
    metrics=["accuracy", keras.metrics.AUC(name="auc")],
)

# ─── Callbacks ────────────────────────────────────────────────────────────────
callbacks = [
    ModelCheckpoint(
        MODEL_SAVE_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1,
    ),
    EarlyStopping(
        monitor="val_loss",
        patience=7,
        restore_best_weights=True,
        verbose=1,
    ),
    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=3,
        min_lr=1e-7,
        verbose=1,
    ),
    TensorBoard(log_dir="model/logs", histogram_freq=1),
]

# ─── Class Weights (handle imbalance) ─────────────────────────────────────────
total = train_generator.samples
fake_count = sum(1 for l in train_generator.classes if l == 0)
real_count = total - fake_count

class_weight = {
    0: (total / (2 * fake_count)) if fake_count > 0 else 1.0,
    1: (total / (2 * real_count)) if real_count > 0 else 1.0,
}
print(f"Class weights: {class_weight}")

# ─── Train ────────────────────────────────────────────────────────────────────
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=val_generator,
    callbacks=callbacks,
    class_weight=class_weight,
)

# ─── Save History ─────────────────────────────────────────────────────────────
history_dict = {k: [float(v) for v in vals] for k, vals in history.history.items()}
with open(HISTORY_SAVE_PATH, "w") as f:
    json.dump(history_dict, f, indent=2)

print(f"\nModel saved to: {MODEL_SAVE_PATH}")
print(f"History saved to: {HISTORY_SAVE_PATH}")

# ─── Plot Training Curves ─────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].plot(history.history["accuracy"], label="Train Acc")
axes[0].plot(history.history["val_accuracy"], label="Val Acc")
axes[0].set_title("Model Accuracy")
axes[0].set_xlabel("Epoch")
axes[0].set_ylabel("Accuracy")
axes[0].legend()
axes[0].grid(True)

axes[1].plot(history.history["loss"], label="Train Loss")
axes[1].plot(history.history["val_loss"], label="Val Loss")
axes[1].set_title("Model Loss")
axes[1].set_xlabel("Epoch")
axes[1].set_ylabel("Loss")
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.savefig("model/training_curves.png", dpi=150)
plt.show()
print("Training curves saved to model/training_curves.png")

# ─── Evaluate on Validation Set ───────────────────────────────────────────────
val_generator.reset()
results = model.evaluate(val_generator, verbose=1)
print(f"\nFinal Validation — Loss: {results[0]:.4f} | Accuracy: {results[1]:.4f} | AUC: {results[2]:.4f}")
