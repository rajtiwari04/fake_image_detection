const express = require("express");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const {
  analyzeImage,
  getHistory,
  getDetectionById,
  deleteDetection,
  getAdminStats,
} = require("../controllers/detectionController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// ─── Multer Config ────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext          = path.extname(file.originalname).toLowerCase();
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only JPEG, PNG, WebP, BMP images are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024,
  },
});

// ─── Multer Error Handler ─────────────────────────────────────────────────────
const handleMulterError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: `File too large. Max size: ${process.env.MAX_FILE_SIZE_MB || 10} MB.` });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  upload.single("image"),
  handleMulterError,
  analyzeImage
);

router.get("/history",         protect, getHistory);
router.get("/admin/stats",     protect, adminOnly, getAdminStats);
router.get("/:id",             protect, getDetectionById);
router.delete("/:id",          protect, deleteDetection);

module.exports = router;
