require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const morgan   = require("morgan");
const path     = require("path");

const connectDB        = require("./config/db");
const authRoutes       = require("./routes/authRoutes");
const detectionRoutes  = require("./routes/detectionRoutes");

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
}));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ─── Serve uploaded images statically ────────────────────────────────────────
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d",
    etag: true,
  })
);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",   authRoutes);
app.use("/api/detect", detectionRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error.",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡  API base: http://localhost:${PORT}/api`);
  console.log(`🖼️   Uploads: http://localhost:${PORT}/uploads\n`);
});

module.exports = app;
