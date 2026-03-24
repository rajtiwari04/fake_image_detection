const path      = require("path");
const fs        = require("fs");
const axios     = require("axios");
const FormData  = require("form-data");
const Detection = require("../models/Detection");

// ─── @route  POST /api/detect ─────────────────────────────────────────────────
// ─── @access Private
const analyzeImage = async (req, res) => {
  const startTime = Date.now();

  if (!req.file) {
    return res.status(400).json({ error: "No image file uploaded." });
  }

  const { filename, originalname, mimetype, size, path: filePath } = req.file;

  try {
    // ── Send image to Flask ML API ─────────────────────────────────────────
    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath), {
      filename: originalname,
      contentType: mimetype,
    });

    const flaskResponse = await axios.post(
      `${process.env.FLASK_API_URL}/predict`,
      formData,
      {
        headers: { ...formData.getHeaders() },
        timeout: 30000,   // 30s
      }
    );

    const { prediction, confidence, raw_score, demo, message } = flaskResponse.data;
    const processingTimeMs = Date.now() - startTime;

    // ── Save detection record to MongoDB ──────────────────────────────────
    const detection = await Detection.create({
      user:             req.user._id,
      imageName:        filename,
      imagePath:        `uploads/${filename}`,
      originalName:     originalname,
      mimeType:         mimetype,
      fileSize:         size,
      prediction,
      confidence,
      rawScore:         raw_score,
      isDemo:           demo || false,
      processingTimeMs,
    });

    await detection.populate("user", "name email");

    return res.status(200).json({
      message: "Image analyzed successfully.",
      detection,
      mlMessage: message || null,
    });
  } catch (error) {
    // ── Clean up uploaded file on error ───────────────────────────────────
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (error.code === "ECONNREFUSED" || error.code === "ECONNRESET") {
      return res.status(503).json({
        error:   "ML API is unavailable. Ensure the Flask server is running on port 5001.",
        details: error.message,
      });
    }
    if (error.response) {
      return res.status(502).json({
        error:   "ML API returned an error.",
        details: error.response.data,
      });
    }

    console.error("analyzeImage error:", error);
    return res.status(500).json({ error: "Image analysis failed." });
  }
};

// ─── @route  GET /api/detect/history ─────────────────────────────────────────
// ─── @access Private
const getHistory = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.prediction) {
      filter.prediction = req.query.prediction.toUpperCase();
    }

    const [detections, total] = await Promise.all([
      Detection.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email"),
      Detection.countDocuments(filter),
    ]);

    return res.status(200).json({
      detections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getHistory error:", error);
    return res.status(500).json({ error: "Failed to fetch history." });
  }
};

// ─── @route  GET /api/detect/:id ─────────────────────────────────────────────
// ─── @access Private
const getDetectionById = async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id:  req.params.id,
      user: req.user._id,
    }).populate("user", "name email");

    if (!detection) {
      return res.status(404).json({ error: "Detection record not found." });
    }

    return res.status(200).json({ detection });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid detection ID." });
    }
    console.error("getDetectionById error:", error);
    return res.status(500).json({ error: "Server error." });
  }
};

// ─── @route  DELETE /api/detect/:id ──────────────────────────────────────────
// ─── @access Private
const deleteDetection = async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });

    if (!detection) {
      return res.status(404).json({ error: "Detection record not found." });
    }

    // Delete file from disk
    const absPath = path.join(__dirname, "..", detection.imagePath);
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
    }

    await detection.deleteOne();

    return res.status(200).json({ message: "Detection deleted successfully." });
  } catch (error) {
    console.error("deleteDetection error:", error);
    return res.status(500).json({ error: "Failed to delete detection." });
  }
};

// ─── @route  GET /api/detect/admin/stats ─────────────────────────────────────
// ─── @access Admin
const getAdminStats = async (req, res) => {
  try {
    const [total, fakeCount, realCount, recentUploads, topUsers] =
      await Promise.all([
        Detection.countDocuments(),
        Detection.countDocuments({ prediction: "FAKE" }),
        Detection.countDocuments({ prediction: "REAL" }),
        Detection.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("user", "name email"),
        Detection.aggregate([
          { $group: { _id: "$user", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          { $unwind: "$userInfo" },
          {
            $project: {
              count: 1,
              "userInfo.name": 1,
              "userInfo.email": 1,
            },
          },
        ]),
      ]);

    const avgConfidence = await Detection.aggregate([
      { $group: { _id: null, avg: { $avg: "$confidence" } } },
    ]);

    return res.status(200).json({
      stats: {
        total,
        fakeCount,
        realCount,
        fakePercent: total ? ((fakeCount / total) * 100).toFixed(1) : 0,
        realPercent: total ? ((realCount / total) * 100).toFixed(1) : 0,
        avgConfidence: avgConfidence[0]?.avg
          ? (avgConfidence[0].avg * 100).toFixed(2)
          : 0,
      },
      recentUploads,
      topUsers,
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    return res.status(500).json({ error: "Failed to fetch admin stats." });
  }
};

module.exports = {
  analyzeImage,
  getHistory,
  getDetectionById,
  deleteDetection,
  getAdminStats,
};
