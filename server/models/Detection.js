const mongoose = require("mongoose");

const detectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageName: {
      type: String,
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
    },
    fileSize: {
      type: Number,   // bytes
    },
    prediction: {
      type: String,
      enum: ["REAL", "FAKE"],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    rawScore: {
      type: Number,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    processingTimeMs: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for fast user-specific queries ─────────────────────────────────────
detectionSchema.index({ user: 1, createdAt: -1 });
detectionSchema.index({ prediction: 1 });

// ─── Virtual: confidence as percentage ────────────────────────────────────────
detectionSchema.virtual("confidencePercent").get(function () {
  return (this.confidence * 100).toFixed(2) + "%";
});

module.exports = mongoose.model("Detection", detectionSchema);
